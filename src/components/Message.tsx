"use client";

import { motion } from "framer-motion";
import { Message as MessageType } from "@/lib/types";
import FormattedText from "./FormattedText";
import WelcomeCard from "./cards/WelcomeCard";
import PrivacyCard from "./cards/PrivacyCard";
import QuestionCard from "./cards/QuestionCard";
import SectionHeader from "./cards/SectionHeader";
import SuccessCard from "./cards/SuccessCard";
import SuckStatementCard from "./cards/SuckStatementCard";
import ComparisonTable from "./cards/ComparisonTable";
import AutopsyReportCard from "./cards/AutopsyReportCard";
import ToolsRecommendationCard from "./cards/ToolsRecommendationCard";
import WorkflowDesignCard from "./cards/WorkflowDesignCard";
import ModesExplainerCard from "./cards/ModesExplainerCard";
import FlywheelCard from "./cards/FlywheelCard";
import FinalCard from "./cards/FinalCard";
import AcknowledgmentCard from "./cards/AcknowledgmentCard";
import RedirectCard from "./cards/RedirectCard";
import ConclusionCard from "./cards/ConclusionCard";

interface Props {
  message: MessageType;
  isLatest?: boolean;
}

const staggerDelay = 0.6; // seconds between each element

export default function Message({ message, isLatest = false }: Props) {
  // User message
  if (message.role === "user") {
    // Don't show system messages
    if (message.content.startsWith("[")) return null;

    return (
      <div className="flex justify-end">
        <div className="bg-[var(--color-primary)] text-white px-5 py-3 rounded-2xl rounded-br-sm max-w-[85%]">
          <p className="text-[15px] leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  // Helper to render card by type
  const renderCard = (card: typeof message.cards extends (infer T)[] | undefined ? T : never, index: number) => {
    const cardComponent = (() => {
      switch (card.type) {
        case "welcome":
          return <WelcomeCard {...card} />;
        case "privacy":
          return <PrivacyCard {...card} />;
        case "question":
          return <QuestionCard {...card} />;
        case "section-header":
          return <SectionHeader {...card} />;
        case "success":
          return <SuccessCard {...card} />;
        case "suck-statement":
          return <SuckStatementCard {...card} />;
        case "comparison-table":
          return <ComparisonTable {...card} />;
        case "autopsy-report":
          return <AutopsyReportCard {...card} />;
        case "tools-recommendation":
          return <ToolsRecommendationCard {...card} />;
        case "workflow-design":
          return <WorkflowDesignCard {...card} />;
        case "modes-explainer":
          return <ModesExplainerCard {...card} />;
        case "flywheel":
          return <FlywheelCard {...card} />;
        case "final":
          return <FinalCard {...card} />;
        case "acknowledgment":
          return <AcknowledgmentCard {...card} />;
        case "redirect":
          return <RedirectCard {...card} />;
        case "conclusion":
          return <ConclusionCard {...card} />;
        default:
          return (
            <div className="card p-5">
              <p className="text-[var(--color-text)]">{card.content}</p>
              {card.subcontent && (
                <p className="text-[var(--color-text-muted)] mt-2">{card.subcontent}</p>
              )}
            </div>
          );
      }
    })();

    // Only animate if this is the latest message
    if (isLatest) {
      return (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: index * staggerDelay,
            ease: [0.34, 1.56, 0.64, 1],
          }}
        >
          {cardComponent}
        </motion.div>
      );
    }

    return <div key={index}>{cardComponent}</div>;
  };

  // Assistant message with cards
  if (message.cards && message.cards.length > 0) {
    const totalCards = message.cards.length;

    return (
      <div className="space-y-4">
        {message.cards.map((card, index) => renderCard(card, index))}
        {message.content && (
          isLatest ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: totalCards * staggerDelay,
                ease: [0.34, 1.56, 0.64, 1],
              }}
            >
              <FormattedText
                text={message.content}
                className="text-[var(--color-text)] text-[15px] leading-relaxed"
              />
            </motion.div>
          ) : (
            <FormattedText
              text={message.content}
              className="text-[var(--color-text)] text-[15px] leading-relaxed"
            />
          )
        )}
      </div>
    );
  }

  // Plain text assistant message
  if (isLatest) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <FormattedText
          text={message.content}
          className="text-[var(--color-text)] text-[15px] leading-relaxed"
        />
      </motion.div>
    );
  }

  return (
    <FormattedText
      text={message.content}
      className="text-[var(--color-text)] text-[15px] leading-relaxed"
    />
  );
}
