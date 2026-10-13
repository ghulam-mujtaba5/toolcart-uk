import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  CartCelebration,
  FulfillmentStepperMotion,
  AiScannerPulse,
  TradeStampMotion,
} from "../../src/components/motion";

describe("Brand V3 Motion Components Suite", () => {
  describe("CartCelebration", () => {
    it("renders with status role and accessible label", () => {
      render(<CartCelebration />);
      const el = screen.getByRole("status");
      expect(el).toBeInTheDocument();
      expect(el).toHaveAttribute("aria-label", "Item added to tool crate");
    });

    it("applies custom size and class names cleanly", () => {
      const { container } = render(<CartCelebration size={64} className="test-class" />);
      const wrapper = container.querySelector(".test-class");
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveStyle({ width: "64px", height: "64px" });
    });
  });

  describe("FulfillmentStepperMotion", () => {
    it("renders packing stage with accessible label", () => {
      render(<FulfillmentStepperMotion stage="packing" />);
      const el = screen.getByRole("status");
      expect(el).toHaveAttribute("aria-label", "Order packing in workshop");
    });

    it("renders transit stage with moving logistics freight", () => {
      render(<FulfillmentStepperMotion stage="transit" />);
      const el = screen.getByRole("status");
      expect(el).toHaveAttribute("aria-label", "Order in logistics transit");
    });

    it("renders delivered stage with stamp verification", () => {
      render(<FulfillmentStepperMotion stage="delivered" />);
      const el = screen.getByRole("status");
      expect(el).toHaveAttribute("aria-label", "Order delivered");
    });
  });

  describe("AiScannerPulse", () => {
    it("renders with scanner role and caliper radar elements", () => {
      render(<AiScannerPulse />);
      const el = screen.getByRole("status");
      expect(el).toHaveAttribute(
        "aria-label",
        "ToolCart AI scanning technical specifications"
      );
    });
  });

  describe("TradeStampMotion", () => {
    it("renders with verification label and hex gear", () => {
      render(<TradeStampMotion label="TRADE PRO VERIFIED" />);
      const el = screen.getByRole("status");
      expect(el).toHaveAttribute("aria-label", "Trade pro application approved");
      expect(screen.getByText("TRADE PRO VERIFIED")).toBeInTheDocument();
    });
  });
});
