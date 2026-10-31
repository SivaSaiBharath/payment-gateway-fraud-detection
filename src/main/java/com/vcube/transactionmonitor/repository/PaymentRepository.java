package com.vcube.transactionmonitor.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vcube.transactionmonitor.entity.Payment;

public interface PaymentRepository extends JpaRepository<Payment,Long>{
	
	
	List<Payment> findByMerchant_MerchantId(Long merchantId);
}
