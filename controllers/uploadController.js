const csv = require("csv-parser");
const fs = require("fs");
const Bank = require("../model/bank");
const Statement = require('../model/statement');
const Account = require("../model/account");

const uploadCSVFiles = async (req, res) => {
    try {
        for (const file of req.files) {
            const results = [];
            let bankName = req.body.bankName;
            bankName.toUpperCase()

            fs.createReadStream(file.path)
                .pipe(csv())
                .on("data", (data) => {
                    let result = {};
                    if (bankName === "HDFC") {

                        const debitAmount = parseFloat(data["Debit Amount"]);
                        const creditAmount = parseFloat(data["Credit Amount"]);
                        const type = debitAmount !== 0
                            ? "DR"
                            : creditAmount !== 0
                                ? "CR"
                                : "";
                        const transaction_amount = type === "DR" ? debitAmount : creditAmount;
                        result.date = data["Date"];
                        result.description = data["Narration"];
                        result.type = type;
                        result.transaction_amount = transaction_amount;
                        result.cheque_no = data["Chq/Ref Number"];
                        result.total_balance = data["Closing Balance"];
                        result.transaction_id = null;
                        result.txn_posted_date = null;
                    } else if (bankName === "ICICI") {
                        result.date = data["Value Date"];
                        result.description = data["Description"];
                        result.type = data["Cr/Dr"];
                        result.transaction_amount = data["Transaction Amount(INR)"];
                        result.cheque_no = data["ChequeNo."];
                        result.total_balance = data["Available Balance(INR)"];
                        result.transaction_id = data['Transaction ID']
                        result.txn_posted_date = data['Txn Posted Date']
                    }
                    result.bank_name = bankName;
                    result.account_number = req.body.AccountNumber;

                    results.push(result);

                })
                .on("end", async () => {
                    try {
                        await Statement.insertMany(results);
                        fs.unlinkSync(file.path);
                    } catch (insertError) {
                        console.error("Error inserting data:", insertError);
                    }
                });
        }

        res.status(200).json({ message: "CSV files uploaded and data saved." });
    } catch (connectionError) {
        console.error("Error connecting to MongoDB:", connectionError);
        res.status(400).json({
            message: "Error uploading CSV files.",
            error: connectionError.message,
        });
    }
};

const login = (req, res) => {
    const hardcodedUsername = "keshav";
    const hardcodedPassword = "123";

    const { name, pass } = req.body;

    if (!name) {
        return res
            .status(400)
            .json({ message: "Username not found", code: "Please fill username" });
    }

    if (!pass) {
        return res
            .status(400)
            .json({ message: "Password not found", code: "Please fill password" });
    }

    if (name === hardcodedUsername && pass === hardcodedPassword) {
        return res
            .status(200)
            .json({ message: "Login Successfully", code: "success" });
    } else {
        return res
            .status(401)
            .json({ message: "Invalid Username and Password", code: "Fail" });
    }
};

const getAll = async (req, res) => {
    const data = await collection.find({})
    console.log(data);
    res.status(200).json({
        message: "fetch data successfully",
        success: true,
        data: data,
    });
};

const postbank = async (req, res) => {
    try {
        const { bankName, IFSCCode, bankAddress } = req.body;
        const savedBank = await Bank.create({
            bankName: bankName,
            IFSCCode: IFSCCode,
            bankAddress: bankAddress
        });
        if (!savedBank) {
            return res.status(500).json({
                code: "Internal-Server-Error",
                error: "Something went wrong while registering Bank detail",
            });
        }
        return res.status(200).json({
            message: "Bank detail Registered Successfully !!",
            Bank: savedBank,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: "Internal-Server-Error",
            error: "Something went wrong while processing your request.",
        });
    }
};

const getBank = async (req, res) => {
    try {
        const banks = await Bank.find({});
        if (!banks) {
            res.status(404).json({
                message: "no data found"
            })
        }
        res.status(200).json({
            data: banks
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        })
    }
}

const postaccount = async (req, res) => {
    try {
        const { accountno, bankName } = req.body;
        const data = await Account.create({
            accountno: accountno,
            bankName: bankName
        })
        if (!data) {
            return res.status(500).json({
                code: "Internal-Server-Error",
                error: "Something went wrong while registering Bank detail",
            });
        }
        return res.status(200).json({
            message: "Accounr details Registered Successfully !!",
            Bank: data,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: "Internal-Server-Error",
            error: "Something went wrong while processing your request.",
        });
    }
}

const getaccount = async (req, res) => {
    try {
        const getaccount = await Account.find().populate('bankName');
        // console.log(getaccount)
        res.status(200).json({ getaccount })
    } catch (error) {
        console.log(error)
    }
}

const getsingleaccount = async (req, res) => {
    try {
        let bankId = req.params.bankId
        const singleaccount = await Account.find({ 'bankName': bankId }).populate('bankName')
        if (!singleaccount) {
            return res.status(404).json({
                message: 'Not found'
            })
        }
        res.status(201).json({
            data: singleaccount
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Internal sever error",
            error: error.message
        })
    }
}

module.exports = { login, uploadCSVFiles, getAll, postbank, postaccount, getaccount, getsingleaccount, getBank };
