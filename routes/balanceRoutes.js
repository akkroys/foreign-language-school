import express from 'express';
import {
    topUpBalance,
    purchaseLesson,
    purchaseTariff,
    getTransactionHistory,
    checkFundsForTariff,
    checkFundsForLesson
} from '../controllers/balanceController.js';

const router = express.Router();

router.post('/top-up', topUpBalance);
router.post('/purchase-lesson', purchaseLesson);
router.post('/purchase-tariff', purchaseTariff);
router.get('/transaction-history', getTransactionHistory);
router.post('/check-funds-tariff', checkFundsForTariff);
router.post('/check-funds-lesson', checkFundsForLesson);

export default router;
