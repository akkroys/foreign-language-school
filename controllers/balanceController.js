import BalanceModel from '../models/balanceModel.js';
import TariffsModel from '../models/tariffsModel.js';
import StudentModel from '../models/studentModel.js';

export const topUpBalance = (req, res) => {
    const userId = req.user.id;
    const { amount } = req.body;

    BalanceModel.addToBalance(userId, amount, (err, newBalance) => {
        if (err) {
            console.error("Ошибка при пополнении баланса:", err);
            return res.status(500).send("Ошибка при пополнении баланса");
        }

        BalanceModel.addCashFlow(userId, amount, (err, cashFlowId) => {
            if (err) {
                console.error("Ошибка при добавлении записи в cashFlow:", err);
                return res.status(500).send("Ошибка при добавлении записи в cashFlow");
            }
            BalanceModel.addTransaction(userId, 'Пополнение баланса', cashFlowId, (err, transactionId) => {
                if (err) {
                    console.error("Ошибка при добавлении транзакции:", err);
                    return res.status(500).send("Ошибка при добавлении транзакции");
                }

                res.status(200).send({ newBalance, transactionId });
            });
        });
    });

};

export const purchaseLesson = (req, res) => {
    const userId = req.user.id;
    const { cost } = req.body;

    if (typeof cost !== 'number' || cost <= 0) {
        return res.status(400).send("Неправильная стоимость занятия");
    }

    BalanceModel.addCashFlow(userId, cost, (err, cashFlowId) => {
        if (err) {
            console.error("Ошибка при добавлении в cashFlow:", err);
            return res.status(500).send("Ошибка при добавлении в cashFlow");
        }

        BalanceModel.deductFromBalance(userId, cost, (err, newBalance) => {
            if (err) {
                console.error("Ошибка при списании баланса:", err);
                return res.status(500).send("Ошибка при списании баланса");
            }

            const customMessage = 'Приобретено одно занятие';

            BalanceModel.addTransaction(userId, customMessage, cashFlowId, (err, transactionId) => {
                if (err) {
                    console.error("Ошибка при добавлении транзакции:", err);
                    return res.status(500).send("Ошибка при добавлении транзакции");
                }

                StudentModel.addLessons(userId, 1, (err) => {
                    if (err) {
                        console.error("Ошибка при добавлении занятия студенту:", err);
                        return res.status(500).send("Ошибка при добавлении занятия студенту");
                    }

                    res.status(200).send({ newBalance, transactionId, cashFlowId });
                });
            });
        });
    });
};


export const purchaseTariff = (req, res) => {
    const userId = req.user.id;
    const { tariffId } = req.body;

    TariffsModel.getTariffById(tariffId, (err, tariff) => {
        if (err || !tariff) {
            console.error("Ошибка при получении тарифа:", err);
            return res.status(500).send("Ошибка при получении тарифа");
        }

        const { amount, lessonsCount } = tariff;

        BalanceModel.addCashFlow(userId, amount, (err, cashFlowId) => {
            if (err) {
                console.error("Ошибка при добавлении в cashFlow:", err);
                return res.status(500).send("Ошибка при добавлении в cashFlow");
            }

            BalanceModel.deductFromBalance(userId, amount, (err, newBalance) => {
                if (err) {
                    console.error("Ошибка при списании баланса:", err);
                    return res.status(500).send("Ошибка при списании баланса");
                }

                const customMessage = `Куплен тариф: ${tariff.title}`;

                BalanceModel.addTransaction(userId, customMessage, cashFlowId, (err, transactionId) => {
                    if (err) {
                        console.error("Ошибка при добавлении транзакции:", err);
                        return res.status(500).send("Ошибка при добавлении транзакции");
                    }

                    StudentModel.addLessons(userId, lessonsCount, (err) => {
                        if (err) {
                            console.error("Ошибка при обновлении количества занятий:", err);
                            return res.status(500).send("Ошибка при обновлении количества занятий");
                        }

                        res.status(200).send({ newBalance, transactionId, cashFlowId });
                    });
                });
            });
        });
    });
};


export const getTransactionHistory = (req, res) => {
    const userId = req.user.id;

    BalanceModel.getUserTransactions(userId, (err, transactions) => {
        if (err) {
            console.error("Ошибка при получении истории транзакций:", err);
            return res.status(500).send("Ошибка при получении истории транзакций");
        }

        res.status(200).json(transactions);
    });
};

export const checkFundsForTariff = (req, res) => {
    const userId = req.user.id;
    const { tariffId } = req.body;

    TariffsModel.getTariffById(tariffId, (err, tariff) => {
        if (err) {
            console.error("Ошибка при получении тарифа:", err);
            return res.status(500).send("Ошибка при получении тарифа");
        }

        if (!tariff) {
            return res.status(404).send("Тариф не найден");
        }

        const { amount } = tariff;

        BalanceModel.getUserBalance(userId, (err, balance) => {
            if (err) {
                console.error("Ошибка при получении баланса:", err);
                return res.status(500).send("Ошибка при получении баланса");
            }

            if (balance < amount) {
                res.status(200).send({ status: 'insufficient' });
            } else {
                res.status(200).send({ status: 'sufficient' });
            }
        });
    });
};

export const checkFundsForLesson = (req, res) => {
    const userId = req.user.id;
    const { cost } = req.body;

    if (typeof cost !== 'number' || cost <= 0) {
        return res.status(400).send("Неправильная стоимость урока");
    }

    BalanceModel.getUserBalance(userId, (err, balance) => {
        if (err) {
            console.error("Ошибка при получении баланса:", err);
            return res.status(500).send("Ошибка при получении баланса");
        }

        if (balance < cost) {
            res.status(200).send({ status: 'insufficient' });
        } else {
            res.status(200).send({ status: 'sufficient' });
        }
    });
};
