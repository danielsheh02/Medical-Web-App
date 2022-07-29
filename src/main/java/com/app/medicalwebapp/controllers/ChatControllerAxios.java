package com.app.medicalwebapp.controllers;

import com.app.medicalwebapp.controllers.requestbody.messenger.ChatMessageDeletionTimeChatIdRequest;
import com.app.medicalwebapp.controllers.requestbody.messenger.ChatMessageDeletionRequest;
import com.app.medicalwebapp.controllers.requestbody.messenger.MessagesRequest;
import com.app.medicalwebapp.services.messenger_services.ChatMessageService;
import com.app.medicalwebapp.services.messenger_services.ContactsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@CrossOrigin(origins = "*", maxAge = 604800)
@RestController
@RequestMapping("/api/msg")
public class ChatControllerAxios {

    @Autowired
    private ChatMessageService chatMessageService;

    @Autowired
    private ContactsService contactsService;

    @GetMapping("/all/messages")
    public ResponseEntity<?> getMessages(
            @RequestParam String senderUsername, @RequestParam String recipientUsername
    ) {
        try {
            var messages = chatMessageService.findMessages(senderUsername, recipientUsername);
            return ResponseEntity.ok().body(messages);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/unread/messages")
    public ResponseEntity<?> getUnreadMessages(
            @RequestParam Long recipientId
    ) {
        try {
            var messages = chatMessageService.findUnreadMessages(recipientId);
            return ResponseEntity.ok().body(messages);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/update/messages")
    public ResponseEntity<?> updateMessages(
            @Valid @RequestBody MessagesRequest request
    ) {
        try {
            chatMessageService.updateUnreadMessages(request.getMessages());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/delete")
    public ResponseEntity<?> deleteMessages(
            @Valid @RequestBody ChatMessageDeletionRequest request
    ) {
        try {
            chatMessageService.deleteMessage(request.getMessage());
            if (chatMessageService.findMessages(request.getMessage().getSenderName(), request.getMessage().getRecipientName()).isEmpty()) {
                contactsService.deleteUsersFromEachOthersContacts(request.getMessage().getSenderName(), request.getMessage().getRecipientName());
            }
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/delete/by/time/chatid")
    public ResponseEntity<?> deleteMsgByTimeAndChatId(@Valid @RequestBody ChatMessageDeletionTimeChatIdRequest request) {
        try {
            chatMessageService.deleteMsgByTimeAndChatId(request.getTime(), request.getSenderName(), request.getRecipientName());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @GetMapping("find/messages")
    public ResponseEntity<?> getMessagesByKeywords(
            @RequestParam String senderUsername,
            @RequestParam String recipientUsername,
            @RequestParam String keywordsString
    ) {
        try {
            var foundMessages = chatMessageService.findMessagesByKeywords(senderUsername, recipientUsername, keywordsString);
            return ResponseEntity.ok().body(foundMessages);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
