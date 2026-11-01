package com.vcube.transactionmonitor.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.vcube.transactionmonitor.entity.Transaction;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

	@Query("""
			    SELECT COUNT(t)
			    FROM Transaction t
			    WHERE t.accountId = :accountId
			      AND t.isPinCorrect = false
			      AND t.timestamp >= :sinceTime
			""")
	long pinFailCount(@Param("accountId") Long accountId, @Param("sinceTime") LocalDateTime sinceTime);
	
	
	
	Transaction findTopByAccountIdAndTimestampLessThanOrderByTimestampDesc(
		    Long accountId,
		    LocalDateTime timestamp
		);List<Transaction> findByFlaggedTrueAndStatusNot(
			    Transaction.TransactionStatus status);

		List<Transaction> findByFlaggedFalseAndStatusNot(
		    Transaction.TransactionStatus status);

		List<Transaction> findByStatus(
		    Transaction.TransactionStatus status);
}