const { jsPDF } = require("jspdf");

function generateRTIReportPrompt(projectDocument, userQuery) {
  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const applicationDate = new Date(
    Date.now() - 3 * 24 * 60 * 60 * 1000
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Helper function to format currency
  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const prompt = `
You are an expert government report generator specializing in RTI (Right to Information) Act 2005 reports. Generate a comprehensive, professional RTI report based on the provided project data.

USER QUERY: "${userQuery}"

PROJECT DATA:
${JSON.stringify(projectDocument, null, 2)}

RTI REPORT REQUIREMENTS:

GENERATE A COMPLETE RTI REPORT WITH THE FOLLOWING STRUCTURE:

## HEADER SECTION:
- Title: "RIGHT TO INFORMATION ACT, 2005"
- Subtitle: "INFORMATION DISCLOSURE REPORT"
- RTI Application No: RTI/${
    projectDocument.implementing_department
      ? projectDocument.implementing_department.substring(0, 3).toUpperCase()
      : "GOV"
  }/${new Date().getFullYear()}/${Math.floor(Math.random() * 900000 + 100000)}
- Date of Application: ${applicationDate}
- Date of Response: ${currentDate}
- Public Information Officer: ${
    projectDocument.nodal_officer?.name || "Public Information Officer"
  }
- Department: ${
    projectDocument.implementing_department || "Government Department"
  }
- Applicant: [Name Redacted as per Section 8(1)(j)]

## MAIN CONTENT SECTIONS:

### 1. QUERY RECEIVED
- Subject: Details about the requested project
- Specific Information Requested: (list the typical RTI information requests)

### 2. PROJECT OVERVIEW  
- Project Name: ${projectDocument.project_name}
- Project ID: ${projectDocument.project_id}
- Project Type: ${projectDocument.project_type}
- Sector: ${projectDocument.sector}
- Work Category: ${projectDocument.work_category}
- Current Status: ${projectDocument.status}
- Location: ${projectDocument.location?.district}, ${
    projectDocument.location?.block
  }, ${projectDocument.location?.panchayat}

### 3. SCHEME INFORMATION
- Scheme Name: ${projectDocument.scheme_name}
- Scheme Type: ${projectDocument.scheme_type}
- Scheme Category: ${projectDocument.scheme_category}
- Scheme Description: ${projectDocument.scheme_description}

### 4. FINANCIAL DETAILS
- Total Scheme Budget: ${formatCurrency(projectDocument.total_scheme_budget)}
- Allocated Budget: ${formatCurrency(projectDocument.allocated_budget)}
- Estimated Cost: ${formatCurrency(projectDocument.estimated_cost)}
- Current Amount Spent: ${formatCurrency(projectDocument.current_amount_spent)}
- Remaining Budget: ${formatCurrency(
    (projectDocument.allocated_budget || 0) -
      (projectDocument.current_amount_spent || 0)
  )}
- Physical Progress: ${projectDocument.physical_progress_percentage}%
- Financial Progress: ${
    projectDocument.allocated_budget
      ? (
          (projectDocument.current_amount_spent /
            projectDocument.allocated_budget) *
          100
        ).toFixed(1)
      : 0
  }%

### 5. IMPLEMENTATION DETAILS
- Implementing Department: ${projectDocument.implementing_department}
- Implementing Agency: ${projectDocument.implementing_agency}
- Nodal Officer: ${projectDocument.nodal_officer?.name} (${
    projectDocument.nodal_officer?.designation
  })
- Contact: ${projectDocument.nodal_officer?.contact} | ${
    projectDocument.nodal_officer?.email
  }

### 6. CONTRACTOR INFORMATION
- Company Name: ${projectDocument.contractor?.company_name}
- Registration Number: ${projectDocument.contractor?.registration_number}
- Contractor Class: ${projectDocument.contractor?.contractor_class}
- Contact Person: ${projectDocument.contractor?.contact_person}
- Phone: ${projectDocument.contractor?.contact_details?.phone}
- Email: ${projectDocument.contractor?.contact_details?.email}
- Address: ${projectDocument.contractor?.contact_details?.address}

### 7. PROJECT TIMELINE
- Proposal Date: ${formatDate(projectDocument.timeline?.proposal_date)}
- Approval Date: ${formatDate(projectDocument.timeline?.approval_date)}
- Tender Publication: ${formatDate(
    projectDocument.timeline?.tender_publication_date
  )}
- Work Commencement: ${formatDate(
    projectDocument.timeline?.work_commencement_date
  )}
- Scheduled Completion: ${formatDate(
    projectDocument.timeline?.scheduled_completion_date
  )}
- Actual Completion: ${formatDate(
    projectDocument.timeline?.actual_completion_date
  )}

### 8. BENEFICIARY INFORMATION
- Direct Beneficiaries: ${
    projectDocument.beneficiaries?.direct_beneficiaries || "Not specified"
  }
- Indirect Beneficiaries: ${
    projectDocument.beneficiaries?.indirect_beneficiaries || "Not specified"
  }
- Beneficiary Categories: ${
    projectDocument.beneficiaries?.beneficiary_categories?.join(", ") ||
    "Not specified"
  }

### 9. ADDITIONAL INFORMATION
- Project Description: ${projectDocument.project_description}
- Created Date: ${formatDate(projectDocument.created_at)}
- Last Updated: ${formatDate(projectDocument.updated_at)}
- Created By: ${projectDocument.created_by}
- Last Modified By: ${projectDocument.last_modified_by}

### 10. TRANSPARENCY MEASURES
- Include standard transparency and grievance information
- Public Information Officer contact details
- Appellate authority information

### 11. FOOTER
- Legal disclaimer as per RTI Act 2005
- Authentication code
- Contact information for further queries

FORMATTING INSTRUCTIONS:
1. Use professional government document formatting
2. Include proper section numbering (1., 2., 3., etc.)
3. Use tables for financial and timeline data where appropriate
4. Format all currency amounts in Indian format (₹ with commas)
5. Format all dates in DD/MM/YYYY format
6. Include proper legal disclaimers and citations
7. Use formal government language throughout
8. Add horizontal separators (---) between major sections
9. Bold important headings and labels
10. Include proper spacing for readability

IMPORTANT NOTES:
- If any information is null or undefined, show "Information not available in records"
- Calculate percentages and derived values where possible
- Include all standard RTI report sections even if some data is missing
- Maintain professional tone throughout
- Follow RTI Act 2005 compliance requirements
- Include proper redaction notices for personal information
- IF you the object is empty according to the user query generate respone youself

Generate the complete RTI report now:
`;

  return prompt;
}

// Function to call Gemini and generate RTI report
async function generateRTIReport(projectDocument, userQuery, apiKey) {
  try {
    const prompt = generateRTIReportPrompt(projectDocument, userQuery);

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2, // Low temperature for consistent formatting
            topK: 40,
            topP: 0.8,
            maxOutputTokens: 8192, // Maximum for comprehensive reports
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const reportContent = data.candidates[0].content.parts[0].text;

    return reportContent;
  } catch (error) {
    console.error("Error generating RTI report:", error);
    throw error;
  }
}

function convertRTIReportToPDF_jsPDF(
  reportContent,
  filename = "rti_report.pdf"
) {
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Set margins
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;

    // Government header styling
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("GOVERNMENT OF KERALA", pageWidth / 2, 30, { align: "center" });

    doc.setFontSize(14);
    doc.text("RIGHT TO INFORMATION ACT, 2005", pageWidth / 2, 40, {
      align: "center",
    });
    doc.text("INFORMATION DISCLOSURE REPORT", pageWidth / 2, 50, {
      align: "center",
    });

    // Add horizontal line
    doc.setLineWidth(0.5);
    doc.line(margin, 55, pageWidth - margin, 55);

    // Process the report content
    const lines = reportContent.split("\n");
    let yPosition = 70;

    lines.forEach((line, index) => {
      // Check for page break
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 30;
      }

      // Style different types of content
      if (line.startsWith("##")) {
        // Main headings
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        const heading = line.replace("##", "").trim();
        doc.text(heading, margin, yPosition);
        yPosition += 10;
      } else if (line.startsWith("###")) {
        // Sub headings
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        const subHeading = line.replace("###", "").trim();
        doc.text(subHeading, margin, yPosition);
        yPosition += 8;
      } else if (line.startsWith("**") && line.endsWith("**")) {
        // Bold text
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        const boldText = line.replace(/\*\*/g, "");
        doc.text(boldText, margin, yPosition);
        yPosition += 6;
      } else if (line.startsWith("-")) {
        // Bullet points
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const bulletText = line.replace("-", "•");
        const splitText = doc.splitTextToSize(bulletText, maxWidth - 10);
        doc.text(splitText, margin + 5, yPosition);
        yPosition += splitText.length * 5;
      } else if (line.trim() === "---") {
        // Horizontal separator
        doc.setLineWidth(0.3);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;
      } else if (line.trim() !== "") {
        // Regular text
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const splitText = doc.splitTextToSize(line, maxWidth);
        doc.text(splitText, margin, yPosition);
        yPosition += splitText.length * 5;
      } else {
        // Empty line
        yPosition += 4;
      }
    });

    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - margin,
        pageHeight - 10,
        { align: "right" }
      );
      doc.text("Generated under RTI Act 2005", margin, pageHeight - 10);
    }

    // Save the PDF
    if (typeof window !== "undefined") {
      // Browser environment
      doc.save(filename);
    } else {
      // Node.js environment
      const fs = require("fs");
      const pdfBuffer = doc.output("arraybuffer");
      fs.writeFileSync(filename, Buffer.from(pdfBuffer));
    }

    return doc;
  } catch (error) {
    console.error("Error generating PDF with jsPDF:", error);
    throw error;
  }
}

module.exports = { generateRTIReport, convertRTIReportToPDF_jsPDF };
