export function shouldAutoApplyNewContact(input: {
  autoApplyEnabled: boolean;
  blankOnly: boolean;
  isBlank: boolean;
}): { action: "ignore" | "auto-apply" | "queue-confirm" } {
  if (!input.autoApplyEnabled) {
    return { action: "ignore" };
  }

  if (input.blankOnly) {
    return { action: input.isBlank ? "auto-apply" : "queue-confirm" };
  }

  return { action: "auto-apply" };
}
