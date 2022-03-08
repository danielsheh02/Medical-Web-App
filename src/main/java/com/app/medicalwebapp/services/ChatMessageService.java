package com.app.medicalwebapp.services;

import com.app.medicalwebapp.model.mesages.ChatMessage;
import com.app.medicalwebapp.repositories.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;


@Service
public class ChatMessageService {
    @Autowired
    private ChatMessageRepository chatMessageRepository;

    public ChatMessage save(ChatMessage chatMessage) {
        chatMessageRepository.save(chatMessage);
        return chatMessage;
    }

    public long countNewMessages(Long senderId, Long recipientId) {
        return chatMessageRepository.countBySenderIdAndRecipientId(
                senderId, recipientId);
    }

    public List<ChatMessage> findMessages(Long senderId, Long recipientId) {
//        Long chatId;
        Long chatId = (senderId + recipientId) % 10000; /*TODO. FIX THIS CHAT ID*/
        System.out.println(chatId);
        List<ChatMessage> messages;
        Optional<List<ChatMessage>> messagesOptional = chatMessageRepository.findByChatId(chatId);
        messages = messagesOptional.orElseGet(ArrayList::new);
        System.out.println(messages);
        return messages;
    }
}

