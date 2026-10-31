package com.vcube.transactionmonitor.DTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.vcube.transactionmonitor.entity.Payment.PaymentStatus;

public class PaymentResponse {

	private String paymentReference;

	private BigDecimal amount;

	private String currency;

	private PaymentStatus paymentStatus;

	private LocalDateTime createdAt;

	public String getPaymentReference() {
		return paymentReference;
	}

	public void setPaymentReference(String paymentReference) {
		this.paymentReference = paymentReference;
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
}