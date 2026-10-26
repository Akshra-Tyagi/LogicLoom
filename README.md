# LogicLoom — Vanilla JavaScript Student Dashboard

A standalone student dashboard made with only standard HTML, CSS, and browser JavaScript. It does not use React, TypeScript, a build step, a package manager, or a server framework.

## Run it

1. Extract the ZIP file.
2. Open `index.html` in a modern web browser.
3. Your tasks, subjects, theme, reminders, test plans, and practical-file progress are saved in that browser using `localStorage`.

The bundled MP3 is used by the optional Me Time music player. The logo is drawn inline in the HTML, so no external image service or font download is required.

## The three source files

- `index.html` contains the page shell and links the CSS and JavaScript.
- `style.css` controls the visual design, responsive layout, and light/dark themes.
- `script.js` contains the data, rendering, event handlers, drag-and-drop, timers, calendar, reminders, and browser storage.

Start by reading the `<main>` element in `index.html`, then find the starter data and `renderApp()` near the beginning of `script.js`. Try changing a sample task or subject, save, and refresh the page to see how local storage works.
