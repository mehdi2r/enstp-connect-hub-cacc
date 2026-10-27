<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Reuse the school page through its embedded mode in the legacy guide; origin- and source-checked resize messages keep all content visible without duplicating school content. Height postMessage must target the embedder's origin (document.referrer), not the iframe's own, so embedded guide copies hosted on other origins (e.g. GitHub Pages) also resize.
- Render the student association introduction inline in guide help using the shared section styling and explicit Arabic RTL attributes, without external application links.
- Render assistant language sections with AI Elements MessageResponse and explicit language/direction attributes; keep model language instructions on the server.
