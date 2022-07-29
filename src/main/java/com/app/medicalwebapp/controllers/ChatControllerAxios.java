package com.app.medicalwebapp.controllers;

import com.app.medicalwebapp.controllers.requestbody.MessageResponse;
import com.app.medicalwebapp.controllers.requestbody.messenger.ChatMessageDeletionRequest;
import com.app.medicalwebapp.controllers.requestbody.messenger.EntityByTimeChatIdRequest;
import com.app.medicalwebapp.controllers.requestbody.messenger.MessagesRequest;
import com.app.medicalwebapp.services.FileService;
import com.app.medicalwebapp.services.messenger_services.ChatMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AuthorizationServiceException;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDateTime;
import java.util.Objects;

@CrossOrigin(origins = "*", maxAge = 604800)
@RestController
@RequestMapping("/api/msg")
public class ChatControllerAxios {

    @Autowired
    private ChatMessageService chatMessageService;

    @Autowired
    FileService fileService;

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
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/delete/by/time/chatid")
    public ResponseEntity<?> deleteMsgByTimeAndChatId(@Valid @RequestBody EntityByTimeChatIdRequest request) {
        try {
            chatMessageService.deleteMsgByTimeAndChatId(request.getTime(), request.getSenderName(), request.getRecipientName());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("download/by/send/date/{time}/{senderName}/{recipientName}/{fileName}")
    public ResponseEntity<?> downloadFileBySendDateMsg(
            @PathVariable String time, @PathVariable String senderName,
            @PathVariable String recipientName, @PathVariable String fileName) {
        try {
            var sendDate = LocalDateTime.parse(time);
            var msg = chatMessageService.getMsgByTimeAndChatId(sendDate, senderName, recipientName);
            var fileObjects = msg.getAttachments();
            for (var fileObject : fileObjects) {
                if (Objects.equals(fileObject.getInitialName(), fileName)) {
                    byte[] fileContent = fileService.extractFile(fileObject);
                    return ResponseEntity.ok()
                            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileObject.getInitialName() + "\"")
                            .header(HttpHeaders.CONTENT_TYPE, "application/octet-stream")
                            .body(fileContent);
                }
            }
            return ResponseEntity.badRequest().body(new MessageResponse("Ошибка при скачивании файла"));
        } catch (AuthorizationServiceException ex) {
            ex.printStackTrace();
            return ResponseEntity.badRequest().body(new MessageResponse("Нет прав доступа к этому контенту"));
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.badRequest().body(new MessageResponse("Ошибка при скачивании файла"));
        }
    }

}
