# PayGuard React Frontend — API Integrated

React + Vite frontend organized around the Spring Boot controller endpoints supplied by the project owner.

## Run locally
1. Install Node.js LTS.
2. Extract the ZIP and open this folder in VS Code.
3. Copy `.env.example` to `.env`.
4. Set `VITE_API_BASE_URL` to the Spring Boot base URL.
5. Run:

```bash
npm install
npm run dev
```

Open the local URL shown by Vite, usually `http://localhost:5173`.

## Included screens
- Dashboard: loads transaction, payment, merchant, account, and alert collections where possible.
- Accounts: list, lookup by ID, create.
- Merchants: list, lookup by merchant ID, register.
- Payments: create payment, lookup payment, list payments by merchant.
- Transactions: list all, filter flagged/unflagged, lookup by ID, create.
- Fraud alerts: list all alerts and attempt lookup by ID.

## API endpoint notes
Endpoint paths and capitalization follow the provided controllers:
- `/acc`, `/getAccById/{id}`, `/listOfAcc`
- `/api/v1/merchants/register`, `/api/v1/merchants/{merchantId}`, `/api/v1/merchants`
- `/api/v1/Payments/payment`, `/api/v1/Payments/{paymentId}`, `/api/v1/Payments/merchant/{merchantId}`
- `/Api/transaction`, `/Api/transaction/{id}`, `/Api/transaction?flagged=true|false`
- `/Alerts`, `/Alerts/{id}`

## Important limitations / setup checks
- The supplied controller text does not include all entity and DTO field definitions. Account, merchant, and transaction create forms therefore accept JSON request bodies so you can enter the exact fields from your Java classes without us guessing.
- Payment request fields visible in the service are `merchantId`, `accountId`, `amount`, and `currency`.
- The `/Alerts/{id}` controller parameter is declared `Iterable<Long>`. This is unusual for a single path segment; the frontend calls the route as written, but the backend method may need verification.
- Configure CORS in Spring Boot for the Vite origin during development and the deployed Render URL after deployment.
- This app does not include authentication because no authentication endpoint was supplied.
- For a real payment system, never collect or store real card data or PINs in this frontend. Use test data only.

## Build for deployment
```bash
npm run build
```
The generated static files will be in `dist/`. Deploy as a Render Static Site with build command `npm install && npm run build` and publish directory `dist`.
