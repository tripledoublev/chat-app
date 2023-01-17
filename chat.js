import * as Earthstar from "https://cdn.earthstar-project.org/js/earthstar.web.v10.0.0.js";

// Use the values for shareKeypair which were logged to your console.
const shareKeypair = {
	shareAddress:
		"+chatting.bgnxayo3biun2j3yb4qosumcrdhcfy6albvlfu32mels7t5fz5uta",
	secret: "bqsqgq23hx6g6ub55jiddmcyci4cknlyeycavtorqc72atl35ty2a",
};

// generate random id
function makeid() {
    var result           = '';
    var alphaCharacter   = 'abcdefghijklmnopqrstuvwxyz';
	var alphaLength = alphaCharacter.length;
    var allCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
	var allLength = allCharacters.length;
	result += alphaCharacter.charAt(Math.floor(Math.random() * alphaLength));
    for ( var i = 0; i < 3; i++ ) {
        result += allCharacters.charAt(Math.floor(Math.random() * allLength));
    }
    return result;
}

// Create a new author keypair based on the random id.
let authorKeypair = await Earthstar.Crypto.generateAuthorKeypair(makeid());
// print authorKeypair to console
console.log("authorKeypair ", authorKeypair)
// print authorKeypair to page
document.getElementById("identity-info").innerHTML += 
'Address: ' + authorKeypair.address + '<br>Secret: ' + authorKeypair.secret;

const replica = new Earthstar.Replica({
	driver: new Earthstar.ReplicaDriverWeb(shareKeypair.shareAddress),
	shareSecret: shareKeypair.secret,
});

const form = document.getElementById("message-form");
const input = document.getElementById("message-input");
const idForm = document.getElementById("id-form");
const idInput = document.getElementById("id-input");
const deleteButton = document.getElementById("delete_button");

// Delete messages from chat.
deleteButton.addEventListener("click", async (event) => {
    // This stops the page from reloading.
    event.preventDefault();
    const result = await replica.set(authorKeypair, {
        path: "/chat",
        text: "",
      });
      
    //const result = await replica.wipeDocAtPath(authorKeypair, "/chat/*");
    console.log("result ", result);

	if (Earthstar.isErr(result)) {
		console.error(result);
	}
});

// Send messages to chat.
async function sendMessages(deletionTime) {
    console.log("deletionTime ", deletionTime)
    // Write the contents of the message to the replica.
    const result = await replica.set(authorKeypair, {
        path: `/chat/~${authorKeypair.address}/${Date.now()}!`,
        text: input.value,
        deleteAfter: deletionTime,
    });
    console.log("result ", result);

	if (Earthstar.isErr(result)) {
		console.error(result);
	}

	input.value = "";

};

// Different buttons for different delete times.
document.getElementById("secondsButton").addEventListener("click", function(e) {
    e.preventDefault();
    var deletionTime = (Date.now() + 10000) * 1000;
    sendMessages(deletionTime);
});
document.getElementById("minutesButton").addEventListener("click", function(e){
    e.preventDefault();
    var deletionTime = (Date.now() + (10000 * 60000)) * 1000;
    sendMessages(deletionTime);
});
document.getElementById("hoursButton").addEventListener("click", function(e){
    e.preventDefault();
    var deletionTime = (Date.now() + (10000 * 36000000)) * 1000;
    sendMessages(deletionTime);
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
        if(doc.text === ""){ continue; }
        console.log('doctext ', doc.text);
        message.innerHTML = `<strong>` + alias + `</strong>: ` + doc.text;

		messages.append(message);
	}
}


// Create new Identity.
idForm.addEventListener("submit", async (event) => {
	// This stops the page from reloading.
	event.preventDefault();

	//Creates a new ID.
    const newAuthorKeypair = await Earthstar.Crypto.generateAuthorKeypair(idInput.value);
	
	if (Earthstar.notErr(newAuthorKeypair)) {
        console.group("Author keypair");
        console.log(newAuthorKeypair);
        console.groupEnd();
        authorKeypair = newAuthorKeypair;
        document.getElementById("identity-info").innerHTML += 
        'Address: ' + authorKeypair.address + '<br>Secret: ' + authorKeypair.secret;
     } else if (Earthstar.isErr(newAuthorKeypair)) {
        console.error(newAuthorKeypair);
    }
});

// Create random ID.
const randomButton = document.getElementById("randomID");
randomButton.addEventListener("click", async (event) => {
	// This stops the page from reloading.
	event.preventDefault();

	//Creates a new ID.
    const newAuthorKeypair = await Earthstar.Crypto.generateAuthorKeypair(makeid());
	
	if (Earthstar.notErr(newAuthorKeypair)) {
        console.group("Author keypair");
        console.log(newAuthorKeypair);
        console.groupEnd();
        authorKeypair = newAuthorKeypair;
        document.getElementById("identity-info").innerHTML += 
        'Address: ' + authorKeypair.address + '<br>Secret: ' + authorKeypair.secret;
     } else if (Earthstar.isErr(newAuthorKeypair)) {
        console.error(newAuthorKeypair);
    }
});


cache.onCacheUpdated(() => {
	renderMessages();
});

renderMessages();


const peer = new Earthstar.Peer();
peer.addReplica(replica);
peer.sync("https://blue-southern-muse.glitch.me/", true);

const allDocs = await replica.getAllDocs();
console.log("allDocs ", allDocs);
