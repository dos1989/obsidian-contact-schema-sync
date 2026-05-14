export function buildDefaultSchemaYaml(): string {
  return `version: 1
noteType: contact

frontmatter:
  required:
    - key: name
      type: string
      default: ""
  optional: []

sections:
  - id: basic-info
    heading: "Basic Info"
    level: 2
    managed: true
    template: |
      - Name:
`;
}

export function buildDefaultSchemaDoc(): string {
  return `# Contact Schema

呢份文件用來說明 contact schema 欄位、sections 同維護規則。
`;
}
