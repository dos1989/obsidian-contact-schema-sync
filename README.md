# Contact Schema Sync

Obsidian plugin for syncing contact note structure from a YAML schema.

## Commands
- Sync all contacts
- Sync current contact
- Preview schema changes
- Edit schema
- Create new contact from schema

## Setup
1. Enable the plugin in Obsidian.
2. Set your contacts folder, schema YAML path, and schema doc path in plugin settings.
3. Create a schema file at `_config/contact-schema.yaml`.
4. Use `Contact Schema: Preview schema changes` before applying updates.

## Sync Modes
- `add-only`: adds missing fields and sections
- `full-sync`: removes schema-unknown managed items
- `mark-deprecated`: keeps old data but reports it

## Managed Section Markers
The plugin manages body blocks wrapped in:

```md
<!-- schema:section-id:start -->
...
<!-- schema:section-id:end -->
```
