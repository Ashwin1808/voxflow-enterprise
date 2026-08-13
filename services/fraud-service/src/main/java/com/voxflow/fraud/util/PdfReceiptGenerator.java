package com.voxflow.fraud.util;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Minimal dependency-free PDF writer for the Visual IVR receipt.
 * Builds a valid PDF 1.4 document with Helvetica text lines.
 */
public final class PdfReceiptGenerator {

    private PdfReceiptGenerator() {}

    public static byte[] fraudVerificationReceipt(
            String reference,
            String merchant,
            BigDecimal amount,
            String cardLastFour,
            OffsetDateTime transactionTime,
            String outcome) {

        List<String> lines = new ArrayList<>();
        lines.add("VoxFlow Enterprise — Fraud Verification Receipt");
        lines.add("");
        lines.add("Reference: " + reference);
        lines.add("Merchant:  " + merchant);
        lines.add("Amount:    INR " + amount.toPlainString());
        lines.add("Card:      •••• •••• •••• " + cardLastFour);
        lines.add("Time:      " + transactionTime.format(DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm")));
        lines.add("Outcome:   " + outcome);
        lines.add("");
        lines.add("This receipt confirms your fraud verification response.");
        lines.add("For support, contact your issuing bank's fraud desk.");

        return render(lines);
    }

    private static byte[] render(List<String> lines) {
        StringBuilder doc = new StringBuilder();
        doc.append("%PDF-1.4\n");

        List<String> objects = new ArrayList<>();
        objects.add("<< /Type /Catalog /Pages 2 0 R >>");
        StringBuilder page = new StringBuilder();
        page.append("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 480 640] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>");
        objects.add(page.toString());

        StringBuilder content = new StringBuilder();
        content.append("BT\n/F1 14 Tf\n");
        int y = 560;
        for (String line : lines) {
            content.append("72 ").append(y).append(" Td\n")
                    .append("(").append(escape(line)).append(") Tj\n")
                    .append("0 -22 Td\n");
            y -= 22;
        }
        content.append("ET");
        objects.add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
        objects.add("<< /Length " + content.length() + " >>\nstream\n" + content + "\nendstream");

        long[] offsets = new long[objects.size()];
        for (int i = 0; i < objects.size(); i++) {
            offsets[i] = doc.length();
            doc.append(i + 1).append(" 0 obj\n").append(objects.get(i)).append("\nendobj\n");
        }

        long xref = doc.length();
        doc.append("xref\n0 ").append(objects.size() + 1).append("\n");
        doc.append("0000000000 65535 f \n");
        for (long offset : offsets) {
            doc.append(String.format("%010d 00000 n \n", offset));
        }
        doc.append("trailer\n<< /Size ").append(objects.size() + 1)
                .append(" /Root 1 0 R >>\nstartxref\n").append(xref).append("\n%%EOF");
        return doc.toString().getBytes(java.nio.charset.StandardCharsets.ISO_8859_1);
    }

    private static String escape(String value) {
        return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)");
    }
}
