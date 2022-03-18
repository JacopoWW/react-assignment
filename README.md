## Requirements

### Must
- [✅] * Use `React`
- [✅] * Use `TypeScript`
- [✅] * Write Unit Tests (any testing library, but preferred `jest`)


### Optional

- [❌] * Write E2E Tests (preferred `Playwright`)
- [✅] * If needed use a CSS library (preferred `tailwindcss`)

#### Spec1

- [✅] * User can modify organization details (name).
- [🟨] * (debugging)User can move an organization under the other organization.
- [✅] * user can create an organization.

#### Spec2
- [✅] * User can modify member info (name, age or status).
- [🟨] * (debugging) User can move a member to the other organization.
- [✅] * User can create a member.
- [✅] * User can set a member as the representation, if the member is activated.

#### Notes

- [❌] * User can't proceed to next step unless they have valid inputs.
- [❌] * If their inputs are not valid, show appropriate validation errors.
- [✅] * User can cancel the changes before saving.
- [❌] * Finally when the user submit the form, handle REST API response please.
* Finer details of UX is left for you to decide.
