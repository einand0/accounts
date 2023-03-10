// módulos externos
const inquirer = require('inquirer')
const chalk = require('chalk')

// módulos internos
const fs = require('fs')
const { parse } = require('path')

operation()

function operation() {
    inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'O que você deseja fazer?',
        choices: [
            'Criar Conta',
            'Consultar Saldo',
            'Depositar',
            'Sacar',
            'Sair'
        ]
    }]).then((answer) => {

        const action = answer['action']
        if (action === 'Criar Conta') {
            createAccount()
        } else if(action === 'Depositar'){
            deposit()
        } else if(action === 'Consultar Saldo'){
            getAccountBalance()
        } else if(action === 'Sacar'){
            withdraw()
        } else if(action === 'Sair'){
            console.log(chalk.bgBlue.black('Obrigado por usar o Accounts!'))
            process.exit()
        } else{

        }

    }).catch(err => console.log(err))
}

// create an accout
function createAccount() {
    console.log(chalk.bgGreen.black('Parabéns por escolher o nosso banco!'))
    console.log(chalk.green('Defina as opções da sua conta a seguir:'))
    buildAccount()
}

function buildAccount() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Digite o nome da sua conta:'
        }
    ]).then((answer) => {

        const accountName = answer['accountName']
        console.info(accountName)

        if (!fs.existsSync('accounts')) {
            fs.mkdirSync('accounts')
        }

        if (fs.existsSync(`accounts/${accountName}.json`)) {
            console.log(chalk.bgRed.black('Esta conta já existe, escolha outro nome!'))
            buildAccount()
            return
        }

        fs.writeFileSync(
            `accounts/${accountName}.json`,
            '{"balance": 0}',
            function (err) {
                console.log(err)
            })

            console.log(chalk.green('Parabéns! A sua conta foi criada.'))
            operation()

    }).catch((err) => console.log(err))
}


// add an amount to user account
function deposit(){

    inquirer.prompt([{
        name: 'accountName',
        message: 'Qual o nome da sua conta?'
    }]).then(
        (answer) => {
            const accountName = answer['accountName']

            //verify if account exists
            if(!checkAccount(accountName)){
                return deposit()
            }

            inquirer.prompt([{
                name: 'amount',
                message: 'Quanto você deseja depositar?'
            }]).then(
                (answer) => {
                    const amount = answer['amount']

                    //add an amount
                    addAmount(accountName, amount)

                    operation()
                }
            )
            .catch(err => console.log(err))

        })
        .catch(err => console.log(err))

}



//verify if account exists
function checkAccount(accountName){
    if(!fs.existsSync(`accounts/${accountName}.json`)){
        console.log(chalk.bgRed.black('Esta conta não existe. Tente novamente.'))
        return false
    }

    return true
}

//add an amount
function addAmount(accountName, amount){
    const accountData = getAccount(accountName)

    if(!amount){
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'))
        return deposit()
    }

    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function(err){
            console.log(err)
        },
    )

    console.log(chalk.green(`Foi depositado o valor de R$${amount} na sua conta!`))
}


//read account
function getAccount(accountName){
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf8',
        flag: 'r'
    })

    return JSON.parse(accountJSON)
}


// show account baalnce
function getAccountBalance(){
    inquirer.prompt([{
        name:'accountName',
        message: 'Qual o nome da sua conta?'
    }])
    .then(
        (answer) => {
            const accountName = answer['accountName']

            //verify if account exists
            if(!checkAccount(accountName)){
                return getAccountBalance()
            }

            const accountData = getAccount(accountName)

            console.log(chalk.bgBlue.black(
                `Olá, o saldo da sua conta é de R$${accountData.balance}`
            ))

            operation()
        }
    )
    .catch(err => console.log(err))
}

//withdraw from user's account
function withdraw(){
    inquirer.prompt([{
        name: 'accountName',
        message: 'Qual o nome da sua conta?'
    }])
    .then(
        (answer) => {
            const accountName = answer['accountName']

            if(!checkAccount(accountName)){
                return withdraw()
            }

            inquirer.prompt([{
                name: 'amount',
                message: 'Qual o valor que você deseja sacar?'
            }])
            .then(
                (answer) => {
                    const amount = answer['amount']

                    removeAmount(accountName, amount)

                   
                }
            )
            .catch(err => console.log(err))

        }
    )
    .catch(err => console.log(err))
}

// remove from account
function removeAmount(accountName, amount){
    const accountData = getAccount(accountName)

    if(!amount){
        console.log(chalk.bgRed.black('Ocorreu um erro. Tente novamente mais tarde!'))
        return withdraw()
    }

    if(accountData.balance < amount){
        console.log(chalk.bgRed.black('Valor indisponível!'))
        return withdraw()
    }

    accountData.balance =  parseFloat(accountData.balance) - parseFloat(amount)

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function(err){
            console.log(err)
        }
    )

    console.log(chalk.green(`Foi realizado um saque de R$${amount} da sua conta!`))
    operation()

}