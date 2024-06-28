<template>
  <div class="main_error_block">
    <span class="page_bg">
      <img
        v-for="(img, index) in 10"
        :key="index"
        src="/img/page_bg.svg"
        alt=""
        title=""
        width="100%"
        height="256.4vw"
      />
    </span>
    <div class="content_err">
      <div class="page_container">
        <div class="error_content">
          <img src="/img/404.png" alt="" title="" />
          <div>
            <div class="standard_text">
              The venue you are looking for can’t be found
            </div>
            <router-link custom to="/venue">
              <span class="secondary_btn" tabindex="0"
                >back to home</span
              >
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
