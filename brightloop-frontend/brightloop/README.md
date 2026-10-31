# Brightloop Subscription Management (Frontend Demo)

Open `index.html` directly or serve this folder with VS Code Live Server.

The demo has separate Admin, Staff, and Customer views. Select a staff or customer profile on the login screen to preview its assigned records. Admin can see all sample records; staff can see their assigned customers; customers can see only their own sample account.

Use **Download data (JSON)** to download the records visible to the signed-in demo role. Use **Download receipt** beside an invoice to save a standalone HTML receipt; open it in a browser to print or save it as PDF.

This is a browser-only demo: its sample data and sign-in state are not stored on a server, and the role views are not security controls. Before using it with real customers or launching it as a production service, connect it to a backend with real authentication, authorization, and persistent storage.
