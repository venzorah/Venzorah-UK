import type { VendorApplication } from "../types/marketplace";

export const applications: VendorApplication[] = [
{
  id: "APP-311",
  businessName: "Jollof Junction Foods Ltd",
  categoryId: "cat-food",
  businessType: "Limited company",
  companyNumber: "14822019",
  contactEmail: "hello@jollofjunction.example",
  contactPhone: "07700 900311",
  address: "41 Coventry Road",
  postcode: "B10 0AB",
  zone: "Birmingham",
  submitted: "2026-10-08",
  status: "under_review",
  documents: [
  { name: "Companies House record", state: "verified" },
  { name: "Food business registration", state: "verified" },
  { name: "Food hygiene certificate", state: "pending", fileName: "hygiene-level2.pdf" },
  { name: "Allergen procedure", state: "pending", fileName: "allergen-matrix.pdf" }],

  history: [
  { at: "2026-10-08T10:02:00", status: "submitted", note: "Application submitted", by: "Applicant" },
  { at: "2026-10-08T14:30:00", status: "under_review", note: "Companies House and FBR checked", by: "Grace O." }]

},
{
  id: "APP-312",
  businessName: "Kemi's Kitchen",
  categoryId: "cat-food",
  businessType: "Sole trader",
  contactEmail: "kemi@example.com",
  contactPhone: "07700 900312",
  address: "12 Abbey Lane",
  postcode: "S8 0XY",
  zone: "Sheffield",
  submitted: "2026-10-08",
  status: "submitted",
  documents: [{ name: "Photo ID", state: "pending" }],
  flag: "Food sellers must be registered businesses. Sole traders cannot be approved for food.",
  history: [{ at: "2026-10-08T09:00:00", status: "submitted", note: "Submitted via legacy form", by: "Applicant" }]
},
{
  id: "APP-313",
  businessName: "Serene Hands Massage",
  categoryId: "cat-massage",
  businessType: "Sole trader",
  contactEmail: "book@serenehands.example",
  contactPhone: "07700 900313",
  address: "8 Bristol Road",
  postcode: "B29 6TT",
  zone: "Birmingham",
  submitted: "2026-10-07",
  status: "action_required",
  documents: [
  { name: "Photo ID", state: "verified" },
  { name: "Professional qualification", state: "verified" },
  { name: "Insurance certificate", state: "missing" }],

  history: [
  { at: "2026-10-07T11:00:00", status: "submitted", note: "Application submitted", by: "Applicant" },
  { at: "2026-10-08T09:15:00", status: "action_required", note: "Upload current insurance certificate", by: "Grace O." }]

}];