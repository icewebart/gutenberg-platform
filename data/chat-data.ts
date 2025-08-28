import type { ChatConversation } from "@/types/organization"

export const conversations: ChatConversation[] = [
  {
    id: "conv1",
    participants: ["admin1", "volunteer1"],
    messages: [
      {
        id: "msg1",
        senderId: "admin1",
        content: "Hi John, how are you doing on the park cleanup project?",
        timestamp: "2024-07-28T10:00:00Z",
        isRead: true,
      },
      {
        id: "msg2",
        senderId: "volunteer1",
        content: "Hi Admin! It's going well. We've gathered a lot of support.",
        timestamp: "2024-07-28T10:01:00Z",
        isRead: true,
      },
      {
        id: "msg3",
        senderId: "admin1",
        content: "That's great to hear! Let me know if you need any resources.",
        timestamp: "2024-07-28T10:02:00Z",
        isRead: false,
      },
    ],
  },
  {
    id: "conv2",
    participants: ["admin1", "board1"],
    messages: [
      {
        id: "msg4",
        senderId: "board1",
        content: "We need to discuss the budget for Q4.",
        timestamp: "2024-07-27T15:00:00Z",
        isRead: true,
      },
      {
        id: "msg5",
        senderId: "admin1",
        content: "Of course. I've prepared the preliminary report. I'll send it over.",
        timestamp: "2024-07-27T15:05:00Z",
        isRead: true,
      },
    ],
  },
  {
    id: "conv3",
    participants: ["volunteer1", "participant1"],
    messages: [
      {
        id: "msg6",
        senderId: "volunteer1",
        content: "Hey Jane, welcome to the team! Glad to have you.",
        timestamp: "2024-07-26T11:00:00Z",
        isRead: true,
      },
      {
        id: "msg7",
        senderId: "participant1",
        content: "Thanks John! I'm excited to get started.",
        timestamp: "2024-07-26T11:01:00Z",
        isRead: true,
      },
      {
        id: "msg8",
        senderId: "volunteer1",
        content: "The first orientation session is this Friday. Don't miss it!",
        timestamp: "2024-07-26T11:02:00Z",
        isRead: true,
      },
      {
        id: "msg9",
        senderId: "participant1",
        content: "Got it, thanks for the heads up!",
        timestamp: "2024-07-26T11:03:00Z",
        isRead: false,
      },
    ],
  },
]
