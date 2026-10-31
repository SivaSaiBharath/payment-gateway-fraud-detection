# API Endpoint Map

Base URL comes from `VITE_API_BASE_URL` (default placeholder `http://localhost:8080`). These routes follow the controller source exactly, including capitalization.

| Feature | Method | Path | Frontend action |
|---|---|---|---|
| Accounts | POST | `/acc` | Create account using JSON body |
| Accounts | GET | `/getAccById/{id}` | Find account |
| Accounts | GET | `/listOfAcc` | List accounts |
| Merchants | POST | `/api/v1/merchants/register` | Register merchant using JSON body |
| Merchants | GET | `/api/v1/merchants/{merchantId}` | Find merchant |
| Merchants | GET | `/api/v1/merchants` | List merchants |
| Payments | POST | `/api/v1/Payments/payment` | Create payment |
| Payments | GET | `/api/v1/Payments/{paymentId}` | Find payment |
| Payments | GET | `/api/v1/Payments/merchant/{merchantId}` | List payments for merchant |
| Transactions | POST | `/Api/transaction` | Create transaction using JSON body |
| Transactions | GET | `/Api/transaction/{id}` | Find transaction |
| Transactions | GET | `/Api/transaction` | List transactions |
| Transactions | GET | `/Api/transaction?flagged=true` | List flagged transactions |
| Transactions | GET | `/Api/transaction?flagged=false` | List unflagged transactions |
| Alerts | GET | `/Alerts` | List alerts |
| Alerts | GET | `/Alerts/{id}` | Lookup alert(s) by path parameter |

Account, Merchant and Transaction body fields should be taken from the corresponding Java entity classes. Payment body uses `merchantId`, `accountId`, `amount`, `currency` as implied by `PaymentRequest` usage in the supplied service.
