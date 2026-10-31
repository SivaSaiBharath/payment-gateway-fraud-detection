package com.vcube.transactionmonitor.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.vcube.transactionmonitor.entity.Alerts;
import com.vcube.transactionmonitor.repository.AlertsRepository;

@Service
public class AlertsService {
	
	
	private AlertsRepository alertRepo;
	//CONSTRUCTOR INJECTION
	public AlertsService(AlertsRepository alertRepo){
		this.alertRepo=alertRepo;
	}
	
	
	//METHODS
	
	public List<Alerts> getAllAlerts(){
		return alertRepo.findAll();
	}
	
	
	public Optional<Alerts> getAlertById(Long id) {
	    return alertRepo.findById(id);
	}
	
}
