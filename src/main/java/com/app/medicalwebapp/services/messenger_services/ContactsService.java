package com.app.medicalwebapp.services.messenger_services;

import com.app.medicalwebapp.model.messenger_models.Contact;
import com.app.medicalwebapp.repositories.messenger_repositories.ContactsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.app.medicalwebapp.model.User;
import java.util.List;
import java.util.stream.Collectors;

import java.util.Optional;

@Service
public class ContactsService {

    @Autowired
    private ContactsRepository contactsRepository;

    public Optional<Contact> getByContactsOwner(String contactsOwner) {
        Optional<Contact> contact = Optional.empty();
        try {
            contact = contactsRepository.findByContactsOwner(contactsOwner);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return contact;
    }

    public void deleteUsersFromEachOthersContacts(String contactUsername1, String contactUsername2) {
        try {
            Contact contact1 = contactsRepository.findByContactsOwner(contactUsername1).get();
            Contact contact2 = contactsRepository.findByContactsOwner(contactUsername2).get();

            List<User> contacts1 = contact1.getContactsList();
            List<User> contacts2 = contact2.getContactsList();

            contacts1 = contacts1.stream().filter(user -> !user.getUsername().equals(contact2.getContactsOwner())).collect(Collectors.toList());
            contacts2 = contacts2.stream().filter(user -> !user.getUsername().equals(contact1.getContactsOwner())).collect(Collectors.toList());

            contact1.setContactsList(contacts1);
            contact2.setContactsList(contacts2);

            contactsRepository.save(contact1);
            contactsRepository.save(contact2);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public Contact save(Contact contact) {
        return contactsRepository.save(contact);
    }
}
