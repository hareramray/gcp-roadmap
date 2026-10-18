# Enterprise identity, directories, and productivity boundaries

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcome and prerequisites

Design employee onboarding and offboarding across Google Cloud, an external identity provider, Active Directory, and Google Workspace. This local design exercise needs no domain purchase, directory deployment, or administrative account. Use `PROJECT_ID`, `REGION`, and `ZONE` from the setup guide for the proposed cloud environment. A live implementation requires domain ownership, approved directory administrators, product licenses, appropriate APIs, and a tested emergency-access account. Directory changes can affect an entire organization and should be piloted.

## Distinguish four identity systems

Cloud Identity manages organizational Google identities and groups. Those identities can receive Google Cloud IAM grants. Federation can connect authentication to an external provider while account provisioning and group lifecycle remain separate concerns. A user signing in through single sign-on does not imply that their account, groups, and licenses are automatically maintained. [Cloud Identity overview](https://docs.cloud.google.com/identity/docs/overview).

Workforce Identity Federation lets external human identities access supported Google Cloud products without treating each employee as a service account. It differs from Workload Identity Federation for software. Map stable identity attributes, constrain the trusted issuer, and validate product support, session behavior, and quota-project requirements. An external IdP outage can affect access, so emergency administration must be designed independently. [Workforce federation](https://docs.cloud.google.com/iam/docs/workforce-identity-federation).

Managed Microsoft AD provides actual Active Directory domains for compatible Windows and directory-integrated workloads. It can connect to an existing environment through supported trusts. This is different from SAML/OIDC federation for web applications. DNS, time synchronization, network paths, trust direction, Kerberos, LDAP, group policy, and delegated administration matter. Managed service boundaries mean customers do not receive unrestricted control of every domain-controller component. [Managed Microsoft AD overview](https://docs.cloud.google.com/managed-microsoft-ad/docs/overview).

Google Workspace provides productivity applications and has its own administration, licensing, data sharing, retention, and API authorization. Cloud IAM project ownership does not automatically authorize reading every mailbox or Drive file. Workspace OAuth scopes, user consent, sharing settings, and domain-wide delegation represent separate authority. A service account with domain-wide delegation is especially sensitive and should have narrowly justified scopes and an audited owner.

## Lab: model a joiner, mover, and leaver

1. Create a synthetic identity table:

   ```bash
   cat > identities.csv <<'EOF'
   person,employment,department,cloud_group,workspace_license
   learner-a,employee,analytics,analytics-readers,assigned
   learner-b,contractor,platform,temporary-operators,none
   learner-c,employee,finance,finance-users,assigned
   EOF
   column -s, -t identities.csv
   ```

2. Choose the authoritative source for employment status and group membership. Draw provisioning from HR or the approved directory to the IdP, then to Cloud Identity or workforce attributes as applicable. Do not configure both systems to overwrite the same attribute without a conflict policy.

3. For the joiner, specify immutable identifier, approved groups, MFA enrollment, license assignment, device requirements, and least-privilege access. Map a group to a cloud role at an explicit resource scope. Keep Workspace content access separate from infrastructure administration.

4. For the mover, remove obsolete finance access before or alongside adding analytics access. Include directly granted IAM roles, nested groups, application-local roles, and persistent tokens. A department attribute change is insufficient if access was manually granted elsewhere.

5. For the leaver, disable sign-in, remove groups, revoke or expire sessions where supported, transfer owned business data under policy, handle licenses, and verify cloud access. Identify workloads wrongly running under the person's credentials and migrate them to workload identities. Distinguish account suspension from data deletion and records retention.

6. Add a Windows application that uses AD groups. Document DNS resolution from the application, domain join, trust direction, required network ports according to the official design, service account handling, and disaster recovery. A successful browser SSO test does not validate Kerberos access to that application.

7. Create a break-glass plan with restricted emergency accounts, strong independent authentication, monitored use, custody, periodic testing, and post-use review. Avoid a design in which the only emergency credentials require the same failed IdP to retrieve them.

## Verification and failure modes

Acceptance requires a positive onboarding test and a negative offboarding test for cloud access, the Windows application, and productivity data. Validate the supported user interface and API separately because federation support can differ. [Federated product compatibility](https://docs.cloud.google.com/iam/docs/federated-identity-supported-services).

Common failures include mutable email-based mappings, stale nested membership, duplicate accounts, unmanaged consumer identities, clock skew, broken DNS, excessive OAuth scopes, and assuming “single sign-on” means “single authorization system.” Record propagation and session-expiry delays in the offboarding objective.

## Cleanup, costs, and exercises

Delete the synthetic identity table after review. No users, domains, subscriptions, or directories were created. Real directory services and productivity licenses can have recurring charges. Extend the design to an acquired company with a second IdP and duplicate email aliases. Explain how you prevent account collisions while preserving access evidence and data ownership.

