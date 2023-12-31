<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import ansiEscapes from 'ansi-escapes';
    const dispatch = createEventDispatcher()
    let composingStart = false;
    let compStartKeydownCnt=0;
    let cmd:any='';
    let inputBox:HTMLInputElement;
    function invoke(cmd:string,msg:Object){
        dispatch('invoke',{cmd:cmd,msg:msg});
    }
    function onInput(e:Event){
        if(e instanceof InputEvent){
            const key = e.data;
            const inputType =e.inputType;
            if(key !==null){
                const keyCode = key?.charCodeAt(0)
                var isKR=false
                if( (keyCode < 12593 || keyCode > 12643) && (keyCode < 44032 || keyCode > 55203) ){
                    isKR = false
                }else{
                    isKR = true
                }
           //     console.log('input',inputType,key,composingStart,isKR,keyCode)
                if( inputType==='insertText' ){
//                    console.log('bf ketcnt',compStartKeydownCnt)
                    if(keyCode >=12593 && keyCode <=12643){
                        compStartKeydownCnt=0;
                    }else{
                        compStartKeydownCnt=1;
                    }
                    if(composingStart){ 
                        invoke('write_pty','\u001b[C'+key+'\u001b[D')
                        if(!isKR){
                            composingStart=false;
                            invoke('write_pty','\u001b[C')
                        }
  //                      console.log('pos1')
                    }else{
                        if(isKR){
                            invoke('write_pty',key+'\u001b[D')
                            composingStart=true
//                            console.log('pos2')
                        }else{
                            invoke('write_pty',key)
                            composingStart=false
 //                           console.log('pos3')
                        }
                    }
                    
                }else{
                    
                    if(isKR){
                        invoke('write_pty','\u001b[3~'+key+'\u001b[D')
                    }else{
                        invoke('write_pty',key)
                    }     
                }
            }    
        }
    }
    function beforeInput(e:InputEvent){
        if(e.data !==null && e.data.indexOf("…")>-1){
            e.preventDefault();
            e.stopImmediatePropagation();
            setTimeout(()=>{
                inputBox.selectionStart=255;
                inputBox.selectionEnd=255;
            },0)
        }
        
    }
    function keydown(e:KeyboardEvent){
        const key = e.key;
        if(key =="Backspace" || key =="Delete"){
            if(composingStart){
                compStartKeydownCnt--;
                //console.log('keydown',key,compStartKeydownCnt)
                if(compStartKeydownCnt==0){
                    invoke('write_pty','\u001b[3~')  
                    composingStart=false;
                }
            }else{
                invoke('write_pty','\x7f')    
            }
            return
        }
        if(key =="Enter"){
            invoke('write_pty','\x0D')
            cmd=''
            return
        }
        
        if(key =="Escape"){
            invoke('write_pty','\x1B')
            return
        }
        
        if(key =="Tab"){
            invoke('write_pty','\t')
            return
        }
        if(key =="ArrowUp"){
            invoke('write_pty',ansiEscapes.cursorUp(1).replace('[1','['))
            return
        }
        if(key =="ArrowDown"){
            invoke('write_pty',ansiEscapes.cursorDown(1).replace('[1','['))
            return
        }
        if(key =="ArrowLeft"){
            
            invoke('write_pty',ansiEscapes.cursorBackward(1).replace('[1','['))
            return
        }
        if(key =="ArrowRight"){
            
            invoke('write_pty',ansiEscapes.cursorForward(1).replace('[1','['))
            return
        }
        if(e.ctrlKey){
            if( key=='c'){
                invoke('write_pty','\x03')
                return
            }
            if(key =='u' || key=='w'){
                invoke('write_pty','\x15')
                cmd=''
                return
            }
            if(key =='l'){
                invoke('write_pty','\f')
                cmd=''
                return
            }
            if(key =='e'){
                invoke('write_pty','\x05')
                cmd=''
                return
            }
            if(key =='d'){
                invoke('write_pty','\x04')
                cmd=''
                return
            }
            if(key =='a'){
                invoke('write_pty','\x01')
                cmd=''
                return
            }
            if(key =='k'){
                invoke('write_pty','\x0b')
                cmd=''
                return
            }
            if(key =='z'){
                invoke('write_pty','\x1a')
                cmd=''
                return
            }
        }
        if(composingStart){
            if(!e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey){
                compStartKeydownCnt++;
            }
        }
        //console.log('keydown',key,compStartKeydownCnt)
    }
</script>

<input bind:this={inputBox} type="text" bind:value={cmd} on:beforeinput={beforeInput}  on:keydown={keydown} on:input={(e)=>onInput(e)}   class="w-full">