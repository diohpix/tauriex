<script lang="ts">
    import "../app.css";
    import { invoke } from '@tauri-apps/api/tauri'
    import { Command } from '@tauri-apps/api/shell'
    import { emit, listen } from '@tauri-apps/api/event'
	import { onDestroy, onMount } from "svelte";
    import XTerminal from '../lib/component/XTerminal.svelte'
    import XTemCommand from '../lib/component/Command.svelte'
    
    
    let listTerm: any[]=[];
    let unlisten:Function;
    let PROCESS:any={};
    onMount(async ()=>{
        zsh()
        unlisten = await listen('EVENTS:PTY:STDOUT', (event:any) => {
            const id = event.payload.id
            let term = PROCESS[id];
            if(term==null){
                var _term = listTerm.filter(t=>t.ID==null)[0];
                _term.ref.SetId(id)
                PROCESS[id] = _term.ref
                term =_term.ref;
            }
            const bytes = event.payload.bytes
            term.setMessage(bytes)
        })
    })
    onDestroy(()=>{
        close();
       
    })
    
    async function zsh(){
      let shell = {
	    id: '123423423',
	    name: '12',
	    command: 'zsh',
	    args:[],
	    env: {'TERM':'xterm-256color','LANG':'ko_KR.UTF-8'},
	    icon: ''
       }
       var xt = XTerminal;
       listTerm.push(xt);
       listTerm = listTerm
       var a= await invoke('spawn_pty',{shell});
       console.log('---------------shell---------------')
       
    }
    async function close(){
        for (const [key, value] of Object.entries(PROCESS)) {
            invoke('kill_pty',{id:`${key}`});
        }
        unlisten();
        PROCESS={}
        listTerm=[];
    }
    
    function handleInvoke(e:CustomEvent){
        console.log(e);
        invoke(e.detail.cmd,e.detail.data);
    }
    function handleMultiInvoke(e:CustomEvent){
        for (const [key, value] of Object.entries(PROCESS)) {
            invoke(e.detail.cmd,{id:`${key}`,data:e.detail.msg});
        }
    }
    
   
</script>
<div class="container max-w-screen-xl mx-auto">
    <header>
    <div class="flex items-center space-x-1 rtl:space-x-reverse sm:pe-4">
        <button on:click={zsh} type="button" class="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
            <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 12 20">
                 <path stroke="currentColor" stroke-linejoin="round" stroke-width="2" d="M1 6v8a5 5 0 1 0 10 0V4.5a3.5 3.5 0 1 0-7 0V13a2 2 0 0 0 4 0V6"/>
             </svg>
            <span class="sr-only">Attach file</span>
        </button>
        <button on:click={close} type="button" class="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
            <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 12 20">
                 <path stroke="currentColor" stroke-linejoin="round" stroke-width="2" d="M1 6v8a5 5 0 1 0 10 0V4.5a3.5 3.5 0 1 0-7 0V13a2 2 0 0 0 4 0V6"/>
             </svg>
            <span class="sr-only">Attach file</span>
        </button>
    </div>
    </header>
    <main>
        {#each listTerm as term }
            <svelte:component this={term} bind:this={term.ref} on:invoke={handleInvoke} />
        {/each}
    </main>
    <footer class=" h-96 shadow m-4 dark:bg-gray-800">
        <br>
        <XTemCommand on:invoke={handleMultiInvoke}/>
    </footer>
</div>
  <style>
    .container {
        display: flex;
        flex-direction: column;
        height: 100vh; /* 화면 전체 높이로 설정하거나 필요에 맞게 조절하세요 */
        
        margin-left: 0px;        
        margin-right: 0px;        
        padding-left: 0px; /* 원하는 여백 추가 */
        padding-right: 0px; /* 원하는 여백 추가 */
        max-width: 100%; /* 컨테이너의 최대 너비를 100%로 설정 */
        margin: 0 auto; /* 중앙 정렬을 위해 margin을 auto로 설정 */
    }

    header {
        flex: 0 0 auto; /* 크기를 고정시키기 위해 flex-grow와 flex-shrink를 0으로 설정 */
        background-color: #ccc; /* 배경색은 필요에 따라 변경 가능 */
    }
    footer {
        flex: 0 0 auto; /* 크기를 고정시키기 위해 flex-grow와 flex-shrink를 0으로 설정 */
        padding-left: 0px; /* 원하는 여백 추가 */
        padding-right: 0px; /* 원하는 여백 추가 */
        max-height: 100px;
        width: 100%;
        margin: 0 auto
    }

    main {
        flex: 1; /* 남은 공간을 모두 차지하도록 설정 */
        overflow-y: auto; /* 내용이 넘칠 경우 스크롤바 표시 */
        min-height: 0; /* 내용이 적어도 최소 높이 유지 */
        
      
    }
</style>