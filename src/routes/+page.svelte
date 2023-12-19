<script lang="ts">
    import "../app.css";
    import { invoke } from '@tauri-apps/api/tauri'
    import { Command } from '@tauri-apps/api/shell'
    import { emit, listen } from '@tauri-apps/api/event'
	import { onMount } from "svelte";
    import { AnsiUp } from "ansi_up"
    import {Terminal} from 'xterm'
    import 'xterm/css/xterm.css'
    let name='fff'
    let greetMsg = ''
    let command;
    let shell = {
	id: '1',
	name: '12',
	command: 'zsh',
	args:[],
	env: {},
	
	icon: ''
    }


    let term:any;
    onMount(async ()=>{
        
        term = new Terminal()
        term.open(document.getElementById('terminal')) 
        term.options={"fontSize":12}
        term.onKey(e => {
    console.log(e.key);
    term.write(e.key);
    if (e.key == '\r'){
        term.write('\n');
        term.clear()
    }
})
        const unlisten = await listen('EVENTS:PTY:STDOUT', (event) => {
            
            const { id, bytes } = event.payload
            
            greetMsg += bytesToSring(bytes)
            
  // event.event is the event name (useful if you want to use a single callback fn for multiple event types)
  // event.payload is the payload object
        })
    })
    async function gog(){
        greetMsg = await invoke('spawn_pty',{shell})
        command = new Command('ssh',['xiphoid@hcon.nhnent.com']);
        //command = new Command('ssh',['-l']);
        /*command.on('close', data => {
        console.log(`command finished with code ${data.code} and signal ${data.signal}`)
        });
        command.stdout.on('data', line => console.log(`command stdout: "${line}"`));
        command.stderr.on('data', line => console.log(`command stderr: "${line}"`));
        const child = await command.spawn();
        console.log('pid:', child.pid);
        await child.write('Hello World!\n');*/
    }
    function bytesToSring(bytes) {
        const ansi_up = new AnsiUp();
        var str = String.fromCharCode.apply(null, bytes);
        console.log(str,ansi_up.ansi_to_html(str));
        term.write(str);
        return str;

}
</script>

<body class="h-screen w-screen bg-gray-800">
    <div class="flex items-center space-x-1 rtl:space-x-reverse sm:pe-4">
        <button on:click={gog} type="button" class="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
            <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 12 20">
                 <path stroke="currentColor" stroke-linejoin="round" stroke-width="2" d="M1 6v8a5 5 0 1 0 10 0V4.5a3.5 3.5 0 1 0-7 0V13a2 2 0 0 0 4 0V6"/>
             </svg>
            <span class="sr-only">Attach file</span>
        </button>
        <button type="button" class="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
            <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 20">
                 <path d="M8 0a7.992 7.992 0 0 0-6.583 12.535 1 1 0 0 0 .12.183l.12.146c.112.145.227.285.326.4l5.245 6.374a1 1 0 0 0 1.545-.003l5.092-6.205c.206-.222.4-.455.578-.7l.127-.155a.934.934 0 0 0 .122-.192A8.001 8.001 0 0 0 8 0Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"/>
             </svg>
            <span class="sr-only">Embed map</span>
        </button>
        <button type="button" class="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
            <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 20">
                 <path d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2ZM10.5 6a1.5 1.5 0 1 1 0 2.999A1.5 1.5 0 0 1 10.5 6Zm2.221 10.515a1 1 0 0 1-.858.485h-8a1 1 0 0 1-.9-1.43L5.6 10.039a.978.978 0 0 1 .936-.57 1 1 0 0 1 .9.632l1.181 2.981.541-1a.945.945 0 0 1 .883-.522 1 1 0 0 1 .879.529l1.832 3.438a1 1 0 0 1-.031.988Z"/>
                 <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z"/>
             </svg>
            <span class="sr-only">Upload image</span>
        </button>
        <button type="button" class="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
            <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 20">
                 <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.96 2.96 0 0 0 .13 5H5Z"/>
                 <path d="M14.067 0H7v5a2 2 0 0 1-2 2H0v11a1.969 1.969 0 0 0 1.933 2h12.134A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.933-2ZM6.709 13.809a1 1 0 1 1-1.418 1.409l-2-2.013a1 1 0 0 1 0-1.412l2-2a1 1 0 0 1 1.414 1.414L5.412 12.5l1.297 1.309Zm6-.6-2 2.013a1 1 0 1 1-1.418-1.409l1.3-1.307-1.295-1.295a1 1 0 0 1 1.414-1.414l2 2a1 1 0 0 1-.001 1.408v.004Z"/>
             </svg>
             <span class="sr-only">Format code</span>
        </button>
        <button type="button" class="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
            <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                 <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM13.5 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm-7 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm3.5 9.5A5.5 5.5 0 0 1 4.6 11h10.81A5.5 5.5 0 0 1 10 15.5Z"/>
             </svg>
            <span class="sr-only">Add emoji</span>
        </button>
    </div>
    <div class="h-full">
      <div id="terminal" />
    </div>
  </body>
