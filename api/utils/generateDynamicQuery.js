function generateQueryPrompt(userQuery) {
  const schemaInfo = `
DATABASE SCHEMA INFORMATION:
Collection Name: projects

Schema Fields:
- project_id: String (Format: KL-AGR-WYD-2024-001), unique identifier
- project_name: String, project title
- project_description: String, detailed description  
- project_type: String, values: ["New Construction", "Renovation", "Maintenance", "Supply", "Services"]
- work_category: String, type of work
- sector: String, values: ["Agriculture and Allied Services", "Rural Development", "Irrigation and Flood Control", "Transport and Communications", "Social and Community Services"]

- scheme_name: String, government scheme name
- scheme_description: String, scheme details
- scheme_type: String, values: ["Central", "State", "Local"]
- scheme_category: String, scheme classification

- total_scheme_budget: Number, total budget allocated
- allocated_budget: Number, budget allocated to this project
- estimated_cost: Number, estimated project cost
- current_amount_spent: Number, amount spent so far

- status: String, values: ["Completed", "Ongoing", "Inactive", "Tendering", "Under Approval", "Cancelled"]
- physical_progress_percentage: Number, 0-100

- implementing_department: String, department handling the project
- implementing_agency: String, agency executing the project
- nodal_officer.name: String, officer name
- nodal_officer.designation: String, officer designation
- nodal_officer.contact: String, phone number
- nodal_officer.email: String, email address

- location.state: String, default "Kerala"
- location.district: String, district name
- location.block: String, block name  
- location.panchayat: String, panchayat name
- location.village: String, village name

- timeline.proposal_date: Date, when project was proposed
- timeline.approval_date: Date, when project was approved
- timeline.tender_publication_date: Date, tender published date
- timeline.work_commencement_date: Date, work started date
- timeline.scheduled_completion_date: Date, planned completion
- timeline.actual_completion_date: Date, actual completion

- contractor.company_name: String, contractor company
- contractor.registration_number: String, contractor registration
- contractor.contractor_class: String, values: ["A Class", "B Class", "C Class"]
- contractor.contact_person: String, contact person name
- contractor.contact_details.phone: String, contractor phone
- contractor.contact_details.email: String, contractor email
- contractor.contact_details.address: String, contractor address

- beneficiaries.direct_beneficiaries: Number, direct beneficiary count
- beneficiaries.indirect_beneficiaries: Number, indirect beneficiary count
- beneficiaries.beneficiary_categories: Array of Strings, beneficiary types

- created_at: Date, document creation date
- updated_at: Date, last modification date
- created_by: String, created by user
- last_modified_by: String, last modified by user
`;

  const prompt = `
You are a MongoDB query generator. Convert the following natural language query into a MongoDB query object that can be used with JavaScript/Node.js.

SCHEMA: ${schemaInfo}

USER QUERY: "${userQuery}"

INSTRUCTIONS:
1. Analyze the user query and identify relevant fields from the schema
2. Generate a MongoDB query object using appropriate operators
3. For text searches, use: {"$regex": "search_term", "$options": "i"}
4. For location queries, search in location.district, location.block, location.panchayat, or location.village
5. For project names, search in project_name and project_description fields
6. For financial queries, use appropriate number comparisons (1 lakh = 100000, 1 crore = 10000000)
7. For status queries, use exact match from the enum values
8. For date queries, use $gte, $lte operators with proper Date objects
9. Map common terms to project_type:
   - "renovation", "repair", "rehabilitation", "refurbishment" → "Renovation"
   - "construction", "building", "new" → "New Construction" 
   - "maintenance", "upkeep" → "Maintenance"
   - "supply", "procurement" → "Supply"
   - "services", "consulting" → "Services"
10. Map sectors intelligently:
    - "agriculture", "farming", "crop", "spice", "plantation" → "Agriculture and Allied Services"
    - "rural", "village" → "Rural Development"
    - "irrigation", "water", "flood" → "Irrigation and Flood Control"
    - "road", "transport", "bridge" → "Transport and Communications"
    - "school", "hospital", "community" → "Social and Community Services"
11. Return ONLY valid JSON format
12. Include all relevant conditions in the query

CORRECT EXAMPLES:

User Query: "school renovation project in kothamangalam"
Output: {"$and":[{"$or":[{"project_name":{"$regex":"school","$options":"i"}},{"project_description":{"$regex":"school","$options":"i"}}]},{"project_type":"Renovation"},{"$or":[{"location.district":{"$regex":"kothamangalam","$options":"i"}},{"location.block":{"$regex":"kothamangalam","$options":"i"}},{"location.panchayat":{"$regex":"kothamangalam","$options":"i"}}]}]}

User Query: "projects with budget over 10 lakhs"
Output: {"allocated_budget":{"$gte":1000000}}

User Query: "ongoing projects in ernakulam district"  
Output: {"$and":[{"status":"Ongoing"},{"location.district":{"$regex":"ernakulam","$options":"i"}}]}

User Query: "agriculture rehabilitation work in wayanad"
Output: {"$and":[{"$or":[{"project_name":{"$regex":"agriculture","$options":"i"}},{"project_description":{"$regex":"agriculture","$options":"i"}},{"sector":"Agriculture and Allied Services"}]},{"project_type":"Renovation"},{"$or":[{"location.district":{"$regex":"wayanad","$options":"i"}},{"location.block":{"$regex":"wayanad","$options":"i"}},{"location.panchayat":{"$regex":"wayanad","$options":"i"}}]}]}

Now generate the MongoDB query for: "${userQuery}"

Return ONLY the MongoDB query object in valid JSON format. No explanations or additional text.
`;

  return prompt;
}
// function convertRegexStrings(obj) {
//   if (obj && typeof obj === "object") {
//     for (const key in obj) {
//       if (key === "$regex" && typeof obj[key] === "string") {
//         // remove leading/trailing slashes and extract flags
//         const match = obj[key].match(/^\/(.+)\/([a-z]*)$/i);
//         if (match) {
//           obj[key] = new RegExp(match[1], match[2]);
//         }
//       } else {
//         convertRegexStrings(obj[key]);
//       }
//     }
//   }
// }
function cleanGeminiJSON(raw) {
  // Remove ```json ... ``` or ``` ... ``` if present
  return raw.replace(/^\s*```(?:json)?\s*|\s*```$/g, "").trim();
}

async function getMongoQueryFromGemini(userQuery, apiKey, retries = 3) {
  const prompt = generateQueryPrompt(userQuery); // make sure prompt requests valid JSON with $options
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 0.8,
            maxOutputTokens: 1024,
          },
        }),
      });

      const responseText = await response.text();

      if (!response.ok) {
        if (response.status === 429 && attempt < retries) {
          const wait = Math.pow(2, attempt) * 1000;
          console.warn(`Rate limit hit. Retrying in ${wait} ms...`);
          await new Promise((r) => setTimeout(r, wait));
          continue;
        }
        throw new Error(`Gemini API error ${response.status}: ${responseText}`);
      }

      const data = JSON.parse(responseText);
      const queryString =
        data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!queryString) throw new Error("Gemini returned empty content.");
      const cleanedString = cleanGeminiJSON(queryString);
      const queryObj = JSON.parse(cleanedString);
      //   const queryObj = JSON.parse(queryString);

      function convertRegex(obj) {
        if (obj && typeof obj === "object") {
          for (const key in obj) {
            if (key === "$regex" && obj.$options) {
              obj.$regex = new RegExp(obj.$regex, obj.$options);
              delete obj.$options;
            } else convertRegex(obj[key]);
          }
        }
      }

      convertRegex(queryObj);
      return queryObj;
    } catch (error) {
      if (attempt === retries) {
        console.error("Error generating MongoDB query:", error);
        throw error;
      }
    }
  }
}

async function getProjectData(mongoQuery, ProjectEng) {
  try {
    // Execute the query and get the document
    const projectDocument = await ProjectEng.findOne(mongoQuery);

    if (!projectDocument) {
      throw new Error("No project found matching the query criteria");
    }

    return projectDocument;
  } catch (error) {
    console.error("Error querying database:", error);
    throw error;
  }
}
module.exports = {
  generateQueryPrompt,
  getMongoQueryFromGemini,
  getProjectData,
};
