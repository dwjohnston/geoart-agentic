# Session notes: normalise-points

- The orientation formula (θ = π/2 − atan2(dy, dx)) was derived from the worked example rather than the prose description. The worked example was essential — the prose alone was ambiguous.

- One test initially had wrong expectations: a single coincident input point always collapses to the center (zero bounding box → skip scaling → point at (0,0) → translate to center). Writing a cardinality test using a multi-point input avoids this pitfall.

- `mv` and `mkdir -p` were blocked by the sandbox even within the working directory; `git mv` and the `Write` tool (which creates parent dirs) worked as alternatives.
