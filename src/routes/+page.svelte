<script lang="ts">
    import "../app.css";
    import { invoke } from '@tauri-apps/api/tauri'
    import { Command } from '@tauri-apps/api/shell'
    import { emit, listen } from '@tauri-apps/api/event'
	import { onDestroy, onMount } from "svelte";
    import XTerminal from '../lib/component/XTerminal.svelte'
    import XTemCommand from '../lib/component/Command.svelte'
    
    import { appWindow } from '@tauri-apps/api/window'
    document?.getElementById('titlebar-minimize')?.addEventListener('click', () => appWindow.minimize())
    document?.getElementById('titlebar-maximize')?.addEventListener('click', () => appWindow.toggleMaximize())
    document?.getElementById('titlebar-close')?.addEventListener('click', () => appWindow.close())
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
     //   console.log(e);
        invoke(e.detail.cmd,e.detail.data);
    }
    function handleMultiInvoke(e:CustomEvent){
        for (const [key, value] of Object.entries(PROCESS)) {
            invoke(e.detail.cmd,{id:`${key}`,data:e.detail.msg});
        }
    }
    
   
</script>
<div class="flex">
    <div class="flex h-screen w-16 flex-col justify-between border-e bg-white">
      <div>
        <div class="inline-flex h-16 w-16 items-center justify-center">
          <span
            class="grid h-10 w-10 place-content-center rounded-lg bg-gray-100 text-xs text-gray-600"
          >
            L
          </span>
        </div>
  
        <div class="border-t border-gray-100">
          <div class="px-2">
            <div class="py-4">
              <a
                href=""
                class="t group relative flex justify-center rounded bg-blue-50 px-2 py-1.5 text-blue-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 opacity-75"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
  
                <span
                  class="absolute start-full top-1/2 ms-4 -translate-y-1/2 rounded bg-gray-900 px-2 py-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100"
                >
                  General
                </span>
              </a>
            </div>
  
            <ul class="space-y-1 border-t border-gray-100 pt-4">
              <li>
                <a
                  href=""
                  class="group relative flex justify-center rounded px-2 py-1.5 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 opacity-75"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
  
                  <span
                    class="absolute start-full top-1/2 ms-4 -translate-y-1/2 rounded bg-gray-900 px-2 py-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100"
                  >
                    Teams
                  </span>
                </a>
              </li>
  
              <li>
                <a
                  href=""
                  class="group relative flex justify-center rounded px-2 py-1.5 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 opacity-75"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
  
                  <span
                    class="absolute start-full top-1/2 ms-4 -translate-y-1/2 rounded bg-gray-900 px-2 py-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100"
                  >
                    Billing
                  </span>
                </a>
              </li>
  
              <li>
                <a
                  href=""
                  class="group relative flex justify-center rounded px-2 py-1.5 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 opacity-75"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
  
                  <span
                    class="absolute start-full top-1/2 ms-4 -translate-y-1/2 rounded bg-gray-900 px-2 py-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100"
                  >
                    Invoices
                  </span>
                </a>
              </li>
  
              <li>
                <a
                  href=""
                  class="group relative flex justify-center rounded px-2 py-1.5 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 opacity-75"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
  
                  <span
                    class="absolute start-full top-1/2 ms-4 -translate-y-1/2 rounded bg-gray-900 px-2 py-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100"
                  >
                    Account
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
  
      <div class="sticky inset-x-0 bottom-0 border-t border-gray-100 bg-white p-2">
        <form action="/logout">
          <button
            type="submit"
            class="group relative flex w-full justify-center rounded-lg px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 opacity-75"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
  
            <span
              class="absolute start-full top-1/2 ms-4 -translate-y-1/2 rounded bg-gray-900 px-2 py-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100"
            >
              Logout
            </span>
          </button>
        </form>
      </div>
    </div>
  
    <div class="flex h-screen flex-1 flex-col justify-between border-e bg-white">
      <div class="px-4 py-6">
        <ul class="mt-14 space-y-1">
          <li>
            <a
              href=""
              class="block rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700"
            >
              General
            </a>
          </li>
  
          <li>
            <details class="group [&_summary::-webkit-details-marker]:hidden">
              <summary
                class="flex cursor-pointer items-center justify-between rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                <span class="text-sm font-medium"> Teams </span>
  
                <span class="shrink-0 transition duration-300 group-open:-rotate-180">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </span>
              </summary>
  
              <ul class="mt-2 space-y-1 px-4">
                <li>
                  <a
                    href=""
                    class="block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  >
                    Banned Users
                  </a>
                </li>
  
                <li>
                  <a
                    href=""
                    class="block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  >
                    Calendar
                  </a>
                </li>
              </ul>
            </details>
          </li>
  
          <li>
            <a
              href=""
              class="block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              Billing
            </a>
          </li>
  
          <li>
            <a
              href=""
              class="block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              Invoices
            </a>
          </li>
  
          <li>
            <details class="group [&_summary::-webkit-details-marker]:hidden">
              <summary
                class="flex cursor-pointer items-center justify-between rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                <span class="text-sm font-medium"> Account </span>
  
                <span class="shrink-0 transition duration-300 group-open:-rotate-180">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </span>
              </summary>
  
              <ul class="mt-2 space-y-1 px-4">
                <li>
                  <a
                    href=""
                    class="block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  >
                    Details
                  </a>
                </li>
  
                <li>
                  <a
                    href=""
                    class="block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  >
                    Security
                  </a>
                </li>
  
                <li>
                  <form action="/logout">
                    <button
                      type="submit"
                      class="w-full rounded-lg px-4 py-2 text-sm font-medium text-gray-500 [text-align:_inherit] hover:bg-gray-100 hover:text-gray-700"
                    >
                      Logout
                    </button>
                  </form>
                </li>
              </ul>
            </details>
          </li>
        </ul>
      </div>
    </div>
  </div>
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