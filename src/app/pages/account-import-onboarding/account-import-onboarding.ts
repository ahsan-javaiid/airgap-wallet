import { Component, OnInit, ViewChild } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { IonSlides, Platform } from '@ionic/angular'
import { getProtocolByIdentifier, ICoinProtocol } from 'airgap-coin-lib'

import { DeepLinkProvider } from '../../services/deep-link/deep-link'
import { ErrorCategory, handleErrorSentry } from '../../services/sentry-error-handler/sentry-error-handler'

const DEEPLINK_VAULT_ADD_ACCOUNT: string = `airgap-vault://add-account/`

@Component({
  selector: 'page-account-import-onboarding',
  templateUrl: 'account-import-onboarding.html',
  styleUrls: ['./account-import-onboarding.scss']
})
export class AccountImportOnboardingPage implements OnInit {
  public slide1: string = 'account-import-onboarding-slide_1.png'
  public slide2: string = 'account-import-onboarding-slide_2.png'
  public slide3: string = 'account-import-onboarding-slide_3.png'
  public slide4: string = 'account-import-onboarding-slide_4.png'

  @ViewChild(IonSlides, { static: true })
  public slides: IonSlides
  public slideOpts = {
    initialSlide: 0,
    speed: 400,
    pagination: {
      el: '.swiper-pagination',
      type: 'custom',
      renderCustom: (_swiper, current, total): string => {
        return this.customProgressBar(current, total)
      }
    }
  }
  public protocol: ICoinProtocol
  public subProtocol: ICoinProtocol | undefined

  public isBegin: boolean = true
  public isEnd: boolean = false

  constructor(private readonly route: ActivatedRoute, public platform: Platform, private readonly deeplinkProvider: DeepLinkProvider) {
    if (this.platform.is('ios')) {
      this.slide1 = 'account-import-onboarding-slide_1-ios.png'
      this.slide2 = 'account-import-onboarding-slide_2-ios.png'
      this.slide3 = 'account-import-onboarding-slide_3-ios.png'
      this.slide4 = 'account-import-onboarding-slide_4-ios.png'
    }
  }

  public ngOnInit(): void {
    if (this.route.snapshot.data.special) {
      const info = this.route.snapshot.data.special
      this.protocol = getProtocolByIdentifier(info.mainProtocolIdentifier)
      if (info.subProtocolIdentifier) {
        this.subProtocol = getProtocolByIdentifier(info.subProtocolIdentifier)
      }
    }
  }

  public ionSlideDidChange(): void {
    this.slides
      .getActiveIndex()
      .then((val: number) => {
        this.isBegin = val === 0
        this.isEnd = val === 3
      })
      .catch(handleErrorSentry(ErrorCategory.OTHER))
  }

  public openVault(): void {
    this.deeplinkProvider
      .sameDeviceDeeplink(`${DEEPLINK_VAULT_ADD_ACCOUNT}${this.protocol.identifier}`)
      .catch(handleErrorSentry(ErrorCategory.DEEPLINK_PROVIDER))
  }

  private customProgressBar(current: number, total: number): string {
    const ratio: number = current / total

    const progressBarStyle: string =
      "style='transform: translate3d(0px, 0px, 0px) scaleX(" + ratio + ") scaleY(1); transition-duration: 300ms;'"
    const progressBar: string = "<span class='swiper-pagination-progressbar-fill' " + progressBarStyle + '></span>'

    let progressBarContainer: string =
      "<div class='swiper-pagination-progressbar' style='height: 4px; top: 6px; width: calc(100% - 32px);left: 16px;'>"
    progressBarContainer += progressBar
    progressBarContainer += '</span></div>'

    return progressBarContainer
  }
}
