import { PrivateKey } from 'symbol-sdk';
import { SymbolFacade, Network, KeyPair } from 'symbol-sdk/symbol';

const nodeUrl = 'https://001-sai-dual.symboltest.net:3001';
const privateKey = '';
const textEncoder = new TextEncoder();

const facade = new SymbolFacade(Network.TESTNET.name);

const keyPair = new KeyPair(new PrivateKey(privateKey));

const deadline = facade.now().addHours(2).timestamp;
const messageBytes = textEncoder.encode('Hello, World From TS!');
const message = new Uint8Array(messageBytes.length + 1);

message.set(new Uint8Array([0]), 0);
message.set(messageBytes, 1);
const transaction = facade.transactionFactory.create({
	type: 'transfer_transaction_v1',
	signerPublicKey: keyPair.publicKey.toString(),
	fee: BigInt('1000000'),
	deadline,
	recipientAddress: 'TARDV42KTAIZEF64EQT4NXT7K55DHWBEFIXVJQY',
	mosaics: [
		{ mosaicId: BigInt('0x72C0212E67A08BCE'), amount: BigInt('1000000') }
	],
	message
});

const signature = facade.signTransaction(keyPair, transaction);
const jsonPayload = facade.transactionFactory.static.attachSignature(
	transaction,
	signature
);
const hash = facade.hashTransaction(transaction).toString();

await fetch(`${nodeUrl}/transactions`, {
	method: 'PUT',
	headers: {
		'Content-Type': 'application/json'
	},
	body: jsonPayload
})
	.then(res => res.json())
	.then(data => {
		console.log('announce info :>> ', data.message);
		console.log('tx: :>> ', hash);
	});
