package com.vcube.transactionmonitor.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.vcube.transactionmonitor.DTO.PaymentRequest;
import com.vcube.transactionmonitor.DTO.PaymentResponse;
import com.vcube.transactionmonitor.Utility.PaymentReferenceGenerator;
import com.vcube.transactionmonitor.entity.Accounts;
import com.vcube.transactionmonitor.entity.Merchant;
import com.vcube.transactionmonitor.entity.Merchant.MerchantStatus;
import com.vcube.transactionmonitor.entity.Payment;
import com.vcube.transactionmonitor.entity.Payment.PaymentStatus;
import com.vcube.transactionmonitor.exception.AccountNotFound;
import com.vcube.transactionmonitor.exception.MerchantInactiveException;
import com.vcube.transactionmonitor.exception.MerchantNotFoundException;
import com.vcube.transactionmonitor.repository.AccountsRepository;
import com.vcube.transactionmonitor.repository.MerchantRepository;
import com.vcube.transactionmonitor.repository.PaymentRepository;

@Service
public class PaymentService {
	private final PaymentRepository paymentRepository;
	private final MerchantRepository merchantRepository;
	private final AccountsRepository accountsRepository;

	public PaymentService(PaymentRepository paymentRepository, MerchantRepository merchantRepository,
			AccountsRepository accountsRepository) {

		this.paymentRepository = paymentRepository;
		this.merchantRepository = merchantRepository;
		this.accountsRepository = accountsRepository;
	}

	public PaymentResponse createPayment(PaymentRequest request) {
		System.out.println("MerchantId from request: " + request.getMerchantId());
		Merchant merchant = merchantRepository.findByMerchantId(request.getMerchantId())
				.orElseThrow(() -> new MerchantNotFoundException("Merchant not found"));
		// IF MERCHANT IS INACTIVE OR BLOCKED
		if (merchant.getStatus() == MerchantStatus.INACTIVE) {
			throw new MerchantInactiveException("Merchant is inactive");
		}

		if (merchant.getStatus() == MerchantStatus.BLOCKED) {
			throw new IllegalArgumentException("Merchant is suspended");
		}

		Accounts account = accountsRepository.findById(request.getAccountId())
				.orElseThrow(() -> new AccountNotFound("Account not found"));

		Payment payment = new Payment();

		payment.setMerchant(merchant); // DB FK
		payment.setAccount(account); // DB FK

		payment.setAmount(request.getAmount());
		payment.setCurrency(request.getCurrency());

		payment.setpaymentReference(PaymentReferenceGenerator.generate());

		payment.setPaymentStatus(PaymentStatus.PENDING);

		payment.setCreatedAt(LocalDateTime.now());
		payment.setUpdatedAt(LocalDateTime.now());

		paymentRepository.save(payment);

		// DTO

		PaymentResponse response = new PaymentResponse();

		response.setPaymentReference(payment.getPaymentReference());
		response.setAmount(payment.getAmount());
		response.setCurrency(payment.getCurrency());
		response.setPaymentStatus(payment.getPaymentStatus());
		response.setCreatedAt(payment.getCreatedAt());

		return response;
	}

	public PaymentResponse paymentByID(Long id) {

		Payment payment = new Payment();
		payment = paymentRepository.findById(id).orElseThrow();

		PaymentResponse response = new PaymentResponse();
		response.setAmount(payment.getAmount());
		response.setCreatedAt(payment.getCreatedAt());
		response.setCurrency(payment.getCurrency());
		response.setPaymentReference(payment.getPaymentReference());
		response.setPaymentStatus(payment.getPaymentStatus());

		return response;
	}

	public List<PaymentResponse> listOfPayments(Long merchantId) {

		ArrayList<PaymentResponse> response = new ArrayList<>();

		merchantRepository.findById(merchantId).orElseThrow(() -> new MerchantNotFoundException("Merchant not found"));

		List<Payment> payment = paymentRepository.findByMerchant_MerchantId(merchantId);


		// iterate over all the payment and add to list of resonpse

		for (Payment eachPayment : payment) {
			
			PaymentResponse paymentResponse = new PaymentResponse();

			paymentResponse.setAmount(eachPayment.getAmount());
			paymentResponse.setCreatedAt(eachPayment.getCreatedAt());
			paymentResponse.setCurrency(eachPayment.getCurrency());
			paymentResponse.setPaymentReference(eachPayment.getPaymentReference());
			paymentResponse.setPaymentStatus(eachPayment.getPaymentStatus());

			response.add(paymentResponse);

		}
		return response;
	}
}
