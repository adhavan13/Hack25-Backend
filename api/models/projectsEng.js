    const mongoose = require("mongoose");

    const procurementProjectSchema = new mongoose.Schema(
    {
        // Basic Project Information
        project_id: {
        type: String,
        required: true,
        unique: true,
        index: true,
        match: /^KL-[A-Z]+-[A-Z]+-\d{4}-\d{3}$/, // Format: KL-AGR-WYD-2024-001
        },
        project_name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
        },
        project_description: {
        type: String,
        required: true,
        maxlength: 1000,
        },
        project_type: {
        type: String,
        required: true,
        enum: [
            "New Construction",
            "Renovation",
            "Maintenance",
            "Supply",
            "Services",
        ],
        },
        work_category: {
        type: String,
        required: true,
        trim: true,
        },
        sector: {
        type: String,
        required: true,
        enum: [
            "Agriculture and Allied Services",
            "Rural Development",
            "Irrigation and Flood Control",
            "Transport and Communications",
            "Social and Community Services",
        ],
        },

        // Scheme Information
        scheme_name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
        },
        scheme_description: {
        type: String,
        required: true,
        maxlength: 500,
        },
        scheme_type: {
        type: String,
        required: true,
        enum: ["Central", "State", "Local"],
        },
        scheme_category: {
        type: String,
        required: true,
        trim: true,
        },

        // Financial Information
        total_scheme_budget: {
        type: Number,
        required: true,
        min: 0,
        validate: {
            validator: function (v) {
            return v >= this.allocated_budget;
            },
            message: "Total scheme budget must be >= allocated budget",
        },
        },
        allocated_budget: {
        type: Number,
        required: true,
        min: 0,
        },
        estimated_cost: {
        type: Number,
        required: true,
        min: 0,
        },
        current_amount_spent: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
        validate: {
            validator: function (v) {
            return v <= this.allocated_budget;
            },
            message: "Amount spent cannot exceed allocated budget",
        },
        },

        // Status Information
        status: {
        type: String,
        required: true,
        enum: [
            "Completed",
            "Ongoing",
            "Inactive",
            "Tendering",
            "Under Approval",
            "Cancelled",
        ],
        default: "Under Approval",
        },
        physical_progress_percentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        default: 0,
        },

        // Administrative Details
        implementing_department: {
        type: String,
        required: true,
        trim: true,
        },
        implementing_agency: {
        type: String,
        required: true,
        trim: true,
        },
        nodal_officer: {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        designation: {
            type: String,
            required: true,
            trim: true,
        },
        contact: {
            type: String,
            required: true,
            match: /^\+91-\d{10}$/,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        },
        },

        // Geographic Information
        location: {
        state: {
            type: String,
            required: true,
            default: "Kerala",
        },
        district: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        block: {
            type: String,
            required: true,
            trim: true,
        },
        panchayat: {
            type: String,
            required: true,
            trim: true,
        },
        village: {
            type: String,
            required: true,
            trim: true,
        },
        },

        // Timeline Information
        timeline: {
        proposal_date: {
            type: Date,
            required: true,
        },
        approval_date: {
            type: Date,
            validate: {
            validator: function (v) {
                return !v || v >= this.timeline.proposal_date;
            },
            message: "Approval date must be after proposal date",
            },
        },
        tender_publication_date: {
            type: Date,
            validate: {
            validator: function (v) {
                return (
                !v ||
                !this.timeline.approval_date ||
                v >= this.timeline.approval_date
                );
            },
            message: "Tender publication date must be after approval date",
            },
        },
        work_commencement_date: {
            type: Date,
            validate: {
            validator: function (v) {
                return (
                !v ||
                !this.timeline.tender_publication_date ||
                v >= this.timeline.tender_publication_date
                );
            },
            message: "Work commencement date must be after tender publication",
            },
        },
        scheduled_completion_date: {
            type: Date,
            required: true,
            validate: {
            validator: function (v) {
                return (
                !this.timeline.work_commencement_date ||
                v > this.timeline.work_commencement_date
                );
            },
            message: "Scheduled completion must be after work commencement",
            },
        },
        actual_completion_date: {
            type: Date,
            default: null,
            validate: {
            validator: function (v) {
                return (
                !v ||
                !this.timeline.work_commencement_date ||
                v >= this.timeline.work_commencement_date
                );
            },
            message: "Actual completion must be after work commencement",
            },
        },
        },

        // Contractor Information
        contractor: {
        company_name: {
            type: String,
            required: true,
            trim: true,
        },
        registration_number: {
            type: String,
            required: true,
            trim: true,
            match: /^KL\d{2}[A-Z]\d{7}$/,
        },
        contractor_class: {
            type: String,
            required: true,
            enum: ["A Class", "B Class", "C Class"],
        },
        contact_person: {
            type: String,
            required: true,
            trim: true,
        },
        contact_details: {
            phone: {
            type: String,
            required: true,
            match: /^\+91-\d{10}$/,
            },
            email: {
            type: String,
            required: true,
            lowercase: true,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            },
            address: {
            type: String,
            required: true,
            trim: true,
            maxlength: 300,
            },
        },
        },

        // Beneficiary Information
        beneficiaries: {
        direct_beneficiaries: {
            type: Number,
            required: true,
            min: 0,
        },
        indirect_beneficiaries: {
            type: Number,
            required: true,
            min: 0,
        },
        beneficiary_categories: [
            {
            type: String,
            trim: true,
            },
        ],
        },

        // System Fields
        created_at: {
        type: Date,
        default: Date.now,
        immutable: true,
        },
        updated_at: {
        type: Date,
        default: Date.now,
        },
        created_by: {
        type: String,
        required: true,
        trim: true,
        },
        last_modified_by: {
        type: String,
        required: true,
        trim: true,
        },
        version: {
        type: Number,
        default: 1,
        min: 1,
        },
    },
    {
        timestamps: true, // Automatically manage createdAt and updatedAt
        versionKey: "__v",
    }
    );

    const ProjectEng= mongoose.model("projects", procurementProjectSchema);
    module.exports = ProjectEng;
