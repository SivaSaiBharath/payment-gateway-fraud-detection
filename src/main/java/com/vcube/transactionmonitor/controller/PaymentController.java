package com.vcube.transactionmonitor.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vcube.transactionmonitor.DTO.PaymentRequest;
import com.vcube.transactionmonitor.DTO.PaymentResponse;
import com.vcube.transactionmonitor.service.PaymentService;

@RestController
@RequestMapping("/api/v1/Payments")
public class PaymentController {
	
	private final PaymentService paymentService;
	public PaymentController(PaymentService paymentService ) {
		this.paymentService=paymentService;
	}
	
	@PostMapping("/payment")
	public PaymentResponse payment(@RequestBody PaymentRequest request) {
		return paymentService.createPayment(request);
	}
	
	
	@GetMapping("/{paymentId}")
	public PaymentResponse paymentByID(@PathVariable  Long paymentId) {
		return paymentService.paymentByID(paymentId);
	}
	
	
	
	@GetMapping("/merchant/{merchantId}")
	public List<PaymentResponse> listOfPaymentsByMerchant(@PathVariable  Long merchantId) {
		return paymentService.listOfPayments(merchantId);
	}
}
