import { MongoClient } from "mongodb";
import OpenAI from "openai";
import fs from "fs";
import pdfkit from "pdfkit";

const client = new MongoClient("mongodb://localhost:27017");
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

// Load schema metadata
const schemaMeta = JSON.parse(fs.readFileSync("schema_metadata.json", "utf8"));

async function controller(userQuery) {
  try {
    // 1. Ask LLM to generate MongoDB query
    const queryGen = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a MongoDB expert. Use the following schema to create queries:
          ${JSON.stringify(schemaMeta, null, 2)}`,
        },
        { role: "user", content: `User request: ${userQuery}` },
      ],
    });

    const mongoQuery = queryGen.choices[0].message.content.trim();
    console.log("Generated Query:", mongoQuery);

    // 2. Execute query
    await client.connect();
    const db = client.db("my_database");

    // (⚠️ Safe eval: parse query string into object instead of direct eval)
    const results = await db
      .collection("school_budget")
      .find(JSON.parse(mongoQuery))
      .toArray();

    // 3. Ask LLM to format results into report
    const reportGen = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a data analyst. Write a human-readable report.",
        },
        {
          role: "user",
          content: `Here are the results: ${JSON.stringify(results)}`,
        },
      ],
    });

    const reportText = reportGen.choices[0].message.content;

    // 4. Export report as PDF
    const doc = new pdfkit();
    doc.pipe(fs.createWriteStream("report.pdf"));
    doc.fontSize(14).text("📊 Auto-Generated Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(reportText);
    doc.end();

    console.log("✅ Report generated: report.pdf");
  } catch (err) {
    console.error("Error in pipeline:", err);
  } finally {
    await client.close();
  }
}

// Example run
controller("Show me renovation budget for schools in Wayanad");
