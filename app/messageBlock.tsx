'use client';

import { useMessageStore } from '@/store/useMessageStore';
import styles from './messageBlock.module.css'
import { AnimatePresence, motion } from 'framer-motion';

export default function MessageContainer() {
  const { messages, removeMessage } = useMessageStore();

  return (
    <div className={styles.messageBlockContainer}>
      <AnimatePresence>
        {messages.map((msg) => (
          <motion.div
            className={styles.messageBlock}
            key={msg.id}
            initial={{ scale: 0 }}
            animate={{ scale: '100%' }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              backgroundColor: {
                info: '#dbeafe',
                success: '#dcfce7',
                error: '#fee2e2'
              }[msg.type],
              color: {
                info: '#1e40af',
                success: '#15803d',
                error: '#b91c1c'
              }[msg.type]
            }}
          >
            <p>{msg.text}</p>
            <button className={styles.removeBtn} onClick={() => removeMessage(msg.id)}>X</button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
