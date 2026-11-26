---- MODULE SetupReview ----
EXTENDS TLC
VARIABLES phase, evidence, choice, delta, target, approved, wrote, verified
vars == <<phase, evidence, choice, delta, target, approved, wrote, verified>>
Init ==
    /\ phase = "inspect"
    /\ evidence \in {"match", "unknown", "mismatch"}
    /\ choice = "pending"
    /\ delta = "unchecked"
    /\ target \in BOOLEAN
    /\ approved = FALSE
    /\ wrote = FALSE
    /\ verified = FALSE
Select ==
    /\ phase = "inspect"
    /\ IF evidence = "match" THEN choice' = "yes"
       ELSE IF evidence = "mismatch" THEN choice' = "no"
       ELSE choice' \in {"yes", "no"}
    /\ phase' = IF choice' = "yes" THEN "preview" ELSE "skipped"
    /\ UNCHANGED <<evidence, delta, target, approved, wrote, verified>>
Preview ==
    /\ phase = "preview"
    /\ delta' \in {"safe", "conflict", "equal"}
    /\ phase' = IF delta' = "equal" THEN "verify" ELSE "review"
    /\ UNCHANGED <<evidence, choice, target, approved, wrote, verified>>
Resolve ==
    /\ phase = "review" /\ delta = "conflict"
    /\ delta' = "unchecked" /\ phase' = "preview"
    /\ UNCHANGED <<evidence, choice, target, approved, wrote, verified>>
Confirm ==
    /\ phase = "review" /\ delta = "safe"
    /\ target' = TRUE /\ approved' = TRUE /\ phase' = "ready"
    /\ UNCHANGED <<evidence, choice, delta, wrote, verified>>
Apply ==
    /\ phase = "ready" /\ target /\ approved /\ choice = "yes" /\ delta = "safe"
    /\ wrote' = TRUE /\ phase' = "verify"
    /\ UNCHANGED <<evidence, choice, delta, target, approved, verified>>
Verify ==
    /\ phase = "verify"
    /\ verified' \in BOOLEAN
    /\ phase' = IF verified' THEN "done" ELSE "retry"
    /\ UNCHANGED <<evidence, choice, delta, target, approved, wrote>>
Retry ==
    /\ phase \in {"retry", "pending-repair"}
    /\ phase' = "preview" /\ delta' = "unchecked" /\ approved' = FALSE /\ wrote' = FALSE
    /\ UNCHANGED <<evidence, choice, target, verified>>
Reuse ==
    /\ phase \in {"done", "skipped"}
    /\ phase' = "inspect"
    /\ evidence' \in {"match", "unknown", "mismatch"}
    /\ choice' = "pending" /\ delta' = "unchecked" /\ target' \in BOOLEAN
    /\ approved' = FALSE /\ wrote' = FALSE /\ verified' = FALSE
Cancel ==
    /\ phase \in {"inspect", "preview", "review", "ready"}
    /\ phase' = "skipped" /\ choice' = "no"
    /\ UNCHANGED <<evidence, delta, target, approved, wrote, verified>>
Handoff == /\ phase = "retry" /\ phase' = "pending-repair" /\ UNCHANGED <<evidence, choice, delta, target, approved, wrote, verified>>
Done == /\ phase \in {"done", "skipped", "pending-repair"} /\ UNCHANGED vars
Next == Select \/ Preview \/ Resolve \/ Confirm \/ Apply \/ Verify \/ Retry \/ Reuse \/ Cancel \/ Handoff \/ Done
SafeWrites == wrote => (choice = "yes" /\ target /\ approved /\ delta = "safe" /\ evidence # "mismatch")
VerifiedCompletion == phase = "done" => (verified /\ choice = "yes" /\ (delta = "equal" \/ wrote))
NoImplicitSelection == evidence = "mismatch" => choice # "yes"
FailureNotComplete == phase = "pending-repair" => (~verified /\ choice = "yes")
NoStaleApproval == phase = "inspect" => (~approved /\ ~wrote /\ ~verified)
====
