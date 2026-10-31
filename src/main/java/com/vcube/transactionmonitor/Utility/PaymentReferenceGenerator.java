package com.vcube.transactionmonitor.Utility;

import java.util.UUID;

public class PaymentReferenceGenerator {
	 private PaymentReferenceGenerator() {
	    }

	    public static String generate() {
	        return "PAY" + UUID.randomUUID().toString().replace("-", "")
	                .substring(0, 12)
	                .toUpperCase();
	    }
}
