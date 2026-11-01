package com.vcube.transactionmonitor.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.vcube.transactionmonitor.entity.Transaction;
import com.vcube.transactionmonitor.exception.TransactionNotFoundException;
import com.vcube.transactionmonitor.service.TransactionService;

@RestController
@RequestMapping("/Api/transaction")
public class TransactionController {

	private final TransactionService txnService;

	public TransactionController(TransactionService txnService){
	    this.txnService = txnService;
	}

	@PostMapping()
	public Transaction insertTxn(@RequestBody Transaction txn) {
		return txnService.createTransaction(txn);
	}
	
	
	@GetMapping("/{id}")
	public Transaction getTransaction(@PathVariable Long id) {
		return txnService
		        .getTransaction(id)
		        .orElseThrow(() ->
		                new TransactionNotFoundException(
		                        "Transaction " + id + " not found"));
	}
	
	
	
	
	
	@GetMapping
	public List<Transaction> getTransactions(
	        @RequestParam(required = false) Boolean flagged,
	        @RequestParam(required = false) String status) {

	    if (status != null && status.equalsIgnoreCase("REJECTED")) {
	        return txnService.getRejectedTransactions();
	    }

	    if (flagged != null) {
	        return txnService.getTxnByStatus(flagged);
	    }

	    return txnService.getTransactions();
	}
}
