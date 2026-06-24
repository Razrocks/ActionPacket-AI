# Role Model (Phase 4 — collapsed)

This project is single-user with no auth, so the role / permission / authority / approval models collapse to a single actor. Recorded explicitly so the collapse is a chosen default, not an oversight.

## Sole role: Operator
The freelancer / consultant / small-business operator / project coordinator who runs the app locally.

| Capability | Operator |
|---|---|
| Submit a Request (generate) | ✅ |
| View any Result / History | ✅ |
| Copy follow-up draft | ✅ |
| Download PDF | ✅ |
| Configure env / Google auth | ✅ (local, outside runtime) |

- No second role (approver/admin/viewer). No gating, no approval authority, no permission matrix.
- **Security assumption:** the app runs in a local/trusted environment. There is no authentication; do not expose it publicly without adding auth + per-user isolation (see `security.md`).

## Future (not V1)
If multi-user is ever added: introduce auth, per-user data isolation, and only then a real role/permission model. Until then, this phase stays one role.
