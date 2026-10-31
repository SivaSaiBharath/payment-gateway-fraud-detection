package com.vcube.transactionmonitor.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "payments")
public class Payment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "payment_reference", unique = true, nullable = false)
	private String paymentReference;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "merchant_id", referencedColumnName = "id", nullable = false)
	private Merchant merchant;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "account_id", referencedColumnName = "id", nullable = false)
	private Accounts account;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "transaction_id")
	private Transaction transaction;

	@Column(nullable = false, precision = 15, scale = 2)
	private BigDecimal amount;

	@Column(length = 3, nullable = false)
	private String currency;

	@Enumerated(EnumType.STRING)
	@Column(name = "payment_status", nullable = false)
	private PaymentStatus paymentStatus;

	@Column(name = "created_at")
	private LocalDateTime createdAt;

	@Column(name = "updated_at")
	private LocalDateTime updatedAt;

	public enum PaymentStatus {
		PENDING, SUCCESS, FAILED, FLAGGED, REJECTED
	}

	public Payment() {
	}

	public Long getId() {
		return id;
	}

	public String getPaymentReference() {
		return paymentReference;
	}

	public void setpaymentReference(String paymentReference) {
		this.paymentReference = paymentReference;
	}

	public Merchant getMerchant() {
		return merchant;
	}

	public void setMerchant(Merchant merchant) {
		this.merchant = merchant;
	}

	public Accounts getAccount() {
		return account;
	}

	public void setAccount(Accounts account) {
		this.account = account;	
	}

	public Transaction getTransaction() {
		return transaction;
	}

	public void setTransaction(Transaction transaction) {
		this.transaction = transaction;
	}

	public BigDecimal getAmount() {
		return amount;
	}

	public void setAmount(BigDecimal amount) {
		this.amount = amount;
	}

	public String getCurrency() {
		return currency;
	}

	public void setCurrency(String currency) {
		this.currency = currency;
	}

	public PaymentStatus getPaymentStatus() {
		return paymentStatus;
	}

	public void setPaymentStatus(PaymentStatus paymentStatus) {
		this.paymentStatus = paymentStatus;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}
}