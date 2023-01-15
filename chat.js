import * as Earthstar from "https://cdn.earthstar-project.org/js/earthstar.web.v10.0.0.js";

// Use the values for shareKeypair which were logged to your console.
const shareKeypair = {
	shareAddress:
		"+chatting.bgnxayo3biun2j3yb4qosumcrdhcfy6albvlfu32mels7t5fz5uta",
	secret: "bqsqgq23hx6g6ub55jiddmcyci4cknlyeycavtorqc72atl35ty2a",
};

// Use the values for authorKeypair which were logged to your console.
let authorKeypair = {
	address: "@test.bxadkda4dbuegcrkctbaxsn5crw7epxemkvote5ned43gcgrvmroa",
	secret: "bz6x6fqvkdhvih5utcua4dhmhhheygorce5uqf72ca34tmld46paq",
};

const replica = new Earthstar.Replica({
	driver: new Earthstar.ReplicaDriverWeb(shareKeypair.shareAddress),
	shareSecret: shareKeypair.secret,
});

const form = document.getElementById("message-form");
const input = document.getElementById("message-input");
const idForm = document.getElementById("id-form");
const idInput = document.getElementById("id-input");

// Send messages to chat.
form.addEventListener("submit", async (event) => {
	// This stops the page from reloading.
	event.preventDefault();

	// Write the contents of the message to the replica.
	const result = await replica.set(authorKeypair, {
		text: input.value,
		path: `/chat/~${authorKeypair.address}/${Date.now()}`,
	});
	
	if (Earthstar.isErr(result)) {
		console.error(result);
	}

	input.value = "";

});

// Read messages from chat.
const messages = document.getElementById("messages");

const cache = new Earthstar.ReplicaCache(replica);

function renderMessages() {
	messages.innerHTML = "";

	const chatDocs = cache.queryDocs({
		filter: { pathStartsWith: "/chat" },
        
	});
    console.log("chatDocs ", chatDocs);
	for (const doc of chatDocs) {
		const message = document.createElement("li");
        const alias = doc.author.slice(1, 5);
        message.innerHTML = `<strong>` + alias + `</strong>: ` + doc.text;

		messages.append(message);
	}
}


// Create new Identidy.
idForm.addEventListener("submit", async (event) => {
	// This stops the page from reloading.
	event.preventDefault();

	//Creates a new ID.
    const newAuthorKeypair = await Earthstar.Crypto.generateAuthorKeypair(idInput.value);
	
	if (Earthstar.notErr(authorKeypair)) {
        console.group("Author keypair");
        console.log(authorKeypair);
        console.groupEnd();
        authorKeypair = newAuthorKeypair;
     } else if (Earthstar.isErr(authorKeypair)) {
        console.error(authorKeypair);
    }
});


cache.onCacheUpdated(() => {
	renderMessages();
});

renderMessages();


const peer = new Earthstar.Peer();
peer.addReplica(replica);
peer.sync("https://blue-southern-muse.glitch.me/", true);


