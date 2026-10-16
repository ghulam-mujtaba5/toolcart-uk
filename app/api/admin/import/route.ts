import { NextRequest, NextResponse } from 'next/server';
import { parseAndValidateCatalogCsv } from '@/lib/catalog/importer';
import { getBaselineCatalogCsvText } from '@/lib/catalog/products';
import { parseJsonBody } from '@/lib/api/parse-json-body';
import { requireAdminAuth } from '@/lib/auth/admin';

export async function GET(request: NextRequest) {
  const auth = requireAdminAuth(request);
  if (!auth.success) return auth.response;

  try {
    const searchParams = request.nextUrl.searchParams;
    if (searchParams.get('loadSample') === 'true') {
      const csvContent = getBaselineCatalogCsvText();
      return NextResponse.json({ csv_content: csvContent }, { status: 200 });
    }
    return NextResponse.json({ error: 'Missing required query parameters' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAdminAuth(request);
  if (!auth.success) return auth.response;

  try {
    const searchParams = request.nextUrl.searchParams;

    if (searchParams.get('loadSample') === 'true') {
      const csvContent = getBaselineCatalogCsvText();
      return NextResponse.json({ csv_content: csvContent }, { status: 200 });
    }

    const dryRunParam = searchParams.get('dryRun');
    let dryRun = dryRunParam !== 'false';

    let csvContent = '';

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const parseResult = await parseJsonBody<{
        load_sample?: boolean;
        csv_content?: string;
        dryRun?: boolean;
      }>(request);
      if (!parseResult.success) {
        return parseResult.response;
      }
      const body = parseResult.data;
      if (body.load_sample === true) {
        const sampleCsv = getBaselineCatalogCsvText();
        return NextResponse.json({ csv_content: sampleCsv }, { status: 200 });
      }
      csvContent = body.csv_content || '';
      if (body.dryRun !== undefined) {
        dryRun = Boolean(body.dryRun);
      }
    } else if (contentType.includes('text/csv') || contentType.includes('text/plain')) {
      csvContent = await request.text();
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');
      if (file && typeof file === 'object' && 'text' in file) {
        csvContent = await (file as Blob).text();
      }
      const dryRunForm = formData.get('dryRun');
      if (dryRunForm !== null) {
        dryRun = dryRunForm !== 'false';
      }
    } else {
      csvContent = await request.text();
    }

    if (!csvContent || csvContent.trim().length === 0) {
      return NextResponse.json(
        { error: 'No CSV content provided in request body or file form data' },
        { status: 400 }
      );
    }

    try {
      const report = await parseAndValidateCatalogCsv(csvContent, dryRun);
      return NextResponse.json(report, { status: 200 });
    } catch (csvErr: unknown) {
      const message = csvErr instanceof Error ? csvErr.message : String(csvErr);
      return NextResponse.json(
        { error: 'Invalid CSV format', details: message },
        { status: 400 }
      );
    }
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
