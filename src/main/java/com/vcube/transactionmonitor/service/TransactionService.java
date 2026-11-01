package com.vcube.transactionmonitor.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.vcube.transactionmonitor.entity.Accounts;
import com.vcube.transactionmonitor.entity.Alerts;
import com.vcube.transactionmonitor.entity.Transaction;
import com.vcube.transactionmonitor.exception.AccountLockedException;
import com.vcube.transactionmonitor.exception.AccountNotFound;
import com.vcube.transactionmonitor.repository.AccountsRepository;
import com.vcube.transactionmonitor.repository.AlertsRepository;
import com.vcube.transactionmonitor.repository.TransactionRepository;
import com.vcube.transactionmonitor.rules.RuleEngine;
import com.vcube.transactionmonitor.rules.RuleViolation;

import jakarta.transaction.Transactional;

@Service
public class TransactionService {

	
	private TransactionRepository txnRepo;
	private AccountsRepository accountsRepo;
	private AlertsRepository alertsRepo;
	private RuleEngine ruleEngine;

	
	
	//CONSTRUCTOR INJECTION
	public TransactionService(TransactionRepository txnRepo , AccountsRepository accountsRepo
			, 	AlertsRepository alertsRepo, RuleEngine ruleEngine) {
		
		this.txnRepo=txnRepo;
		this.accountsRepo=accountsRepo;
		this.alertsRepo=alertsRepo;
		this.ruleEngine=ruleEngine;
		
	}

	
	
	public Transaction createTransaction(Transaction txn) {

		// FIND THE RELEVANT ACCOUNT FOR THE TXN OR THROW ERROR

		Accounts account = accountsRepo.findById(txn.getAccountId())
				.orElseThrow(() -> new AccountNotFound("Account not found"));

		// TRANSACTION NEED TO BE SAVED AS PENDING AS DEFAULT

		txn.setStatus(Transaction.TransactionStatus.PENDING);
		txn.setTimestamp(LocalDateTime.now());
		Transaction savedTxn = txnRepo.save(txn);

		// IF ACCOUNT IS ALREADY LOCKED TXN REJECTED AND SAVED
		if (account.getStatus() == Accounts.AccountStatus.LOCKED) {
			savedTxn.setStatus(Transaction.TransactionStatus.REJECTED);

			txnRepo.save(savedTxn);
			throw new AccountLockedException("ACCOUNT LOCKED");

		}

		// PASSING TXN,ACC AS PARAM TO RULE ENGINE

		List<RuleViolation> violations = ruleEngine.evaluate(savedTxn, account);

		if (!violations.isEmpty()) {

			boolean lockAccount = false;
			boolean highSeverityFound = false;

			for (RuleViolation v : violations) {
				Alerts alert = new Alerts();
				alert.setTransactionId(savedTxn.getId());
				alert.setReason(v.getReason());
				alert.setResolved(false);

				// confirm RuleViolation.SeverityType values match Alerts.Severity (LOW,
				// MEDIUM, HIGH)

				alert.setSeverity(Alerts.Severity.valueOf(v.getSeverity().name()));

				// confirm RuleViolation.ActionType values match Alerts.Action
				// (ALERT_ONLY, LOCK_ACCOUNT)

				alert.setAction(Alerts.Action.valueOf(v.getAction().name()));

				if (alert.getAction() == Alerts.Action.LOCK_ACCOUNT) {
					lockAccount = true;
				}
				if (v.getSeverity() == RuleViolation.SeverityType.HIGH) { // enum-to-enum, not string
					highSeverityFound = true;
				}

				alertsRepo.save(alert);

				
			}
			
			
			if (highSeverityFound) {
				account.setStatus(Accounts.AccountStatus.LOCKED);
				accountsRepo.save(account);
			}

			savedTxn.setFlagged(true);

			savedTxn.setStatus(
					lockAccount ? Transaction.TransactionStatus.REJECTED : Transaction.TransactionStatus.FLAGGED);

		} else {
			savedTxn.setStatus(Transaction.TransactionStatus.SUCCESS);
		}

		savedTxn.setTimestamp(LocalDateTime.now());
		return txnRepo.save(savedTxn);
	}
	
	
	public List<Transaction> getRejectedTransactions() {
	    return txnRepo.findByStatus(Transaction.TransactionStatus.REJECTED);
	}
	
	//Transaction by id
	
	public Optional<Transaction> getTransaction(Long id) {
		return txnRepo.findById(id);
	}
	
	
	
	public List<Transaction> getTxnByStatus(boolean flagged) {
	    if (flagged) {
	        return txnRepo.findByFlaggedTrueAndStatusNot(
	            Transaction.TransactionStatus.REJECTED);
	    }

	    return txnRepo.findByFlaggedFalseAndStatusNot(
	        Transaction.TransactionStatus.REJECTED);
	}

	public List<Transaction> getRejectedTransactions1() {
	    return txnRepo.findByStatus(
	        Transaction.TransactionStatus.REJECTED);
	}


	public List<Transaction> getTransactions() {
		return txnRepo.findAll();
	}
}