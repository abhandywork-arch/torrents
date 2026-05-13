# Torrent Home Service Landing Page

Custom code was chosen over WordPress because this is a focused one-page client funnel with a Google automation workflow. A static site is faster to host, easier to maintain, and the form can post directly into a Google Apps Script webhook for Calendar, Gmail, and Sheets.

## Files

- `index.html` contains the landing page.
- `styles.css` contains the responsive visual design.
- `app.js` handles the form and webhook submission.
- `assets/work/` contains optimized project photos from the supplied resource folder.
- `google-apps-script/lead-webhook.gs` contains the Google Calendar, Gmail, and Sheets automation.

## Connect The Form

1. Create a Google Sheet for leads.
2. Open Extensions > Apps Script in that Sheet.
3. Paste the contents of `google-apps-script/lead-webhook.gs`.
4. Deploy as a Web App.
5. Set access to allow the website to submit the form.
6. Copy the Web App URL.
7. Put that URL into `GOOGLE_SCRIPT_URL` in `app.js`.

Until `GOOGLE_SCRIPT_URL` is set, the form opens a prefilled email to `abhandywork@gmail.com` so local testing does not lose lead details.
