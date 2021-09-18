package com.app.medicalwebapp.controllers;

import com.app.medicalwebapp.model.mesages.ChatMessage;
import com.app.medicalwebapp.services.ChatMessageService;
import com.app.medicalwebapp.services.ChatRoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.Optional;

@Controller
public class ChatController {

//    @Autowired
//    private SimpMessagingTemplate simpMessagingTemplate;
    @Autowired
    private ChatMessageService chatMessageService;
    @Autowired
    private ChatRoomService chatRoomService;

    @MessageMapping("/message.send/{recipient}")
    public void sendMessage(@DestinationVariable String recipient, @Payload ChatMessage chatMessage) {
        System.out.println(chatMessage);
        String chatId = chatRoomService.getChatId(chatMessage.getSenderId(), chatMessage.getRecipientId());
        chatMessage.setChatId(chatId);
        chatMessageService.save(chatMessage);
//        simpMessagingTemplate.convertAndSend("/topic/messages/" + recipient, chatMessage);
    }

//    @MessageMapping("/message.send/{recipient}")
//    @SendTo("/topic/public")
//    public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
//        System.out.println("websock3");
//        return chatMessage;
//    }
}