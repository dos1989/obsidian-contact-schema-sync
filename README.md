# Contact Schema Sync

Obsidian plugin for managing contact notes with:
- **properties schema** from `contact-schema.yaml`
- **body template** from `contact-schema.md`

It is designed for people who keep many contact notes in one folder and want a repeatable way to:
- keep properties consistent
- apply a shared body template
- preview changes before updating existing contacts
- auto-initialize newly created blank contact notes

---

## What this plugin does

### 1. Properties schema
The plugin reads a YAML schema file and uses it to sync frontmatter / Properties for contact notes.

Examples:
- add missing fields
- keep fields in schema order
- support basic type coercion such as string → list in safe cases

### 2. Body template
The plugin reads a Markdown template file and applies missing headings into contact note bodies.

Current model:
- `contact-schema.yaml` = properties schema
- `contact-schema.md` = body template

The body template is compared by headings.
Existing same-heading content is preserved.

### 3. Preview-first sync
For existing contacts, the normal workflow is:
1. preview changes
2. inspect what will change
3. apply changes

### 4. New note initialization
The plugin can auto-apply template content to **new blank contact notes** created inside the configured contacts folder.

---

## Current concept

The plugin works best when you separate contact structure into two parts:

### A. `contact-schema.yaml`
Use this for **properties / frontmatter fields**.

Example:

```yaml
version: 1
noteType: contact
frontmatter:
  required:
    - key: Gender
      type: string
      default: ""
    - key: Age range
      type: string
      default: ""
    - key: Tags
      type: list
      default: []
    - key: Relationship
      type: string
      default: ""
  optional: []
sections: []
```

### B. `contact-schema.md`
Use this for the **body template**.

Example:

```md
# Family :

# Occupation :

# Recreation :

# Message :
```

---

## Setup

1. Install the plugin into your vault.
2. Enable it in **Community plugins**.
3. Open plugin settings.
4. Configure:
   - **Contacts folder**
   - **Schema YAML path**
   - **Schema doc path**
5. If the files do not exist yet, use **套用設定** and let the plugin create them.

---

## Settings

### Contacts folder
The folder that contains your contact notes.

### Schema YAML path
The path to the properties schema file.

### Schema doc path
The path to the Markdown body template file.

### 啟用啟動時 existing contacts 檢查
When enabled:
- the plugin checks existing contact notes once at startup
- it shows a single summary notice if some notes can be updated
- it does **not** auto-apply changes

### 啟用空白新聯絡人筆記自動套用
When enabled:
- if you create a **new blank markdown note** inside the contacts folder
- the plugin auto-applies the configured schema/template

This is only for **new blank notes**, not existing notes.

---

## Main workflow

### Edit properties schema
Use:
- **開啟 Schema Editor** in settings
- or command: **Contact Schema: Edit schema**

Schema Editor v1 currently supports:
- version
- note type
- required fields
- optional fields
- field key / type / default
- YAML preview
- validate
- save

### Sync existing contacts
Use:
- **預覽並同步 Contacts** in settings
- or command: **Contact Schema: Sync all contacts**

This opens a preview modal first.
Then you can apply the changes.

### Sync current contact only
Use command:
- **Contact Schema: Sync current contact**

### Create a new contact note
Create a new blank `.md` note inside the contacts folder.
If the blank-note auto-apply switch is enabled, the plugin will initialize it automatically.

---

## Commands

- `Contact Schema: Sync all contacts`
- `Contact Schema: Sync current contact`
- `Contact Schema: Preview schema changes`
- `Contact Schema: Edit schema`
- `Contact Schema: Create new contact from schema` *(placeholder / not fully implemented)*

---

## Current behavior notes

### Existing contacts
- checked separately from new blank notes
- startup check only gives a summary notice
- updates are still manual via preview/apply

### New blank notes
- auto-apply can be enabled independently
- only blank notes are targeted

### Body template behavior
- body template comes from `contact-schema.md`
- headings are used as template sections
- existing same-heading content is preserved
- new inserted sections no longer add visible markers

### Type coercion
Current sync supports some safe coercions, especially for list fields.
Examples:
- `""` → `[]`
- `"a, b"` → `["a", "b"]`

Not every possible type migration is fully generalized yet.

---

## Recommended usage pattern

### For existing contacts
1. Edit `contact-schema.yaml`
2. Edit `contact-schema.md`
3. Run **預覽並同步 Contacts**
4. Review preview
5. Apply changes

### For new contacts
1. Create a new blank note inside the contacts folder
2. Let the plugin auto-apply template (if enabled)
3. Fill in the actual content

---

## Limitations

Current known limitations:
- Schema Editor v1 does not yet provide a full sections editor UI
- Existing-note startup check is summary-only, not a full guided workflow
- Some field type migrations are conservative rather than aggressive
- `Create new contact from schema` command is still a placeholder

---

## Repo

GitHub:
`https://github.com/dos1989/obsidian-contact-schema-sync`
